import { create } from 'zustand'
import type { Connection } from '@xyflow/react'
import { applyNodeChanges, type NodeChange } from '@xyflow/react'
import type { GraphNode, NodeData, Plan, SaveAllResult, StateNodeData } from '../../shared/types'
import {
  addActionBefore,
  addSideFlow,
  addStateBefore,
  connectNodes,
  makeStateNode,
  removeNode,
  updateNodeData,
  centerX,
  COL,
  type Graph
} from '../lib/graph'
import { createEmptyPlan, hasEndpoint } from '../lib/plan'

type View = 'dashboard' | 'editor' | 'settings'
type SaveAllState = 'idle' | 'loading' | 'done'

interface PlanState {
  view: View
  prevView: View
  plans: Plan[]
  current: Plan | null
  editingNodeId: string | null
  saveAllState: SaveAllState

  init: () => Promise<void>
  goDashboard: () => Promise<void>
  goSettings: () => void
  goBack: () => void

  createPlan: () => Promise<void>
  openPlan: (id: string) => Promise<void>
  deletePlan: (id: string) => Promise<void>
  renamePlan: (name: string) => void

  defineEndpoint: (which: 'A' | 'B') => void
  setStateType: (id: string, type: 'A' | 'B' | 'step') => void
  setEditingNode: (id: string | null) => void
  patchNode: (id: string, patch: Record<string, unknown>) => void
  addState: (fromId: string) => void
  addAction: (fromId: string) => void
  addSideFlow: (fromId: string, dir: 'top' | 'bottom') => void
  deleteNode: (id: string) => void

  applyNodeChanges: (changes: NodeChange[]) => void
  connect: (c: Connection) => void

  saveAll: () => Promise<SaveAllResult>
}

let autosaveTimer: ReturnType<typeof setTimeout> | null = null

/** Strip React Flow transient fields so persisted JSON stays clean. */
function serialize(plan: Plan): Plan {
  return {
    ...plan,
    nodes: plan.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data
    })) as GraphNode[],
    edges: plan.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type,
      data: e.data
    }))
  }
}

function scheduleAutosave(get: () => PlanState): void {
  if (autosaveTimer) clearTimeout(autosaveTimer)
  autosaveTimer = setTimeout(() => {
    const plan = get().current
    if (plan) void window.api.savePlan(serialize(plan))
  }, 400)
}

export const usePlanStore = create<PlanState>((set, get) => {
  /** Apply a graph mutation to the current plan and schedule autosave. */
  const commit = (graph: Graph): void => {
    const current = get().current
    if (!current) return
    set({
      current: {
        ...current,
        nodes: graph.nodes,
        edges: graph.edges,
        updatedAt: new Date().toISOString()
      }
    })
    scheduleAutosave(get)
  }

  const asGraph = (): Graph | null => {
    const c = get().current
    return c ? { nodes: c.nodes, edges: c.edges } : null
  }

  return {
    view: 'dashboard',
    prevView: 'dashboard',
    plans: [],
    current: null,
    editingNodeId: null,
    saveAllState: 'idle',

    init: async () => {
      const plans = await window.api.listPlans()
      set({ plans })
    },

    goDashboard: async () => {
      const plans = await window.api.listPlans()
      set({ view: 'dashboard', current: null, editingNodeId: null, plans })
    },

    goSettings: () => set({ prevView: get().view, view: 'settings' }),

    goBack: () => set({ view: get().prevView }),

    createPlan: async () => {
      const plan = createEmptyPlan('Untitled Plan')
      await window.api.savePlan(plan)
      set({ current: plan, view: 'editor', editingNodeId: null })
    },

    openPlan: async (id) => {
      const plan = await window.api.loadPlan(id)
      if (plan) set({ current: plan, view: 'editor', editingNodeId: null })
    },

    deletePlan: async (id) => {
      await window.api.deletePlan(id)
      const plans = await window.api.listPlans()
      set({ plans })
    },

    renamePlan: (name) => {
      const current = get().current
      if (!current) return
      set({ current: { ...current, name, updatedAt: new Date().toISOString() } })
      scheduleAutosave(get)
    },

    defineEndpoint: (which) => {
      const graph = asGraph()
      if (!graph) return
      if (hasEndpoint(get().current as Plan, which)) return

      // Place A at the left, B at the right; wire A -> B once both exist.
      const others = graph.nodes
      let cx = 0
      if (others.length > 0) {
        const xs = others.map(centerX)
        cx = which === 'A' ? Math.min(...xs) - COL : Math.max(...xs) + COL
      }
      const node = makeStateNode(cx, 0, {
        name: which === 'A' ? 'Point A (Start)' : 'Point B (Goal)',
        isEndpoint: which,
        lane: 'main'
      })
      let nextNodes = [...graph.nodes, node]
      let nextEdges = [...graph.edges]

      const a = nextNodes.find((n) => (n.data as { isEndpoint?: string }).isEndpoint === 'A')
      const b = nextNodes.find((n) => (n.data as { isEndpoint?: string }).isEndpoint === 'B')
      if (a && b && !nextEdges.some((e) => e.source === a.id && e.target === b.id)) {
        nextEdges = connectNodes({ nodes: nextNodes, edges: nextEdges }, a.id, b.id).edges
      }
      commit({ nodes: nextNodes, edges: nextEdges })
      set({ editingNodeId: node.id })
    },

    setStateType: (id, type) => {
      const graph = asGraph()
      if (!graph) return
      const isEndpoint = type === 'step' ? undefined : type
      const nodes = graph.nodes.map((n) => {
        if (n.id === id) return { ...n, data: { ...n.data, isEndpoint } as NodeData }
        // Endpoints are unique: clear the same flag from whatever node held it.
        if (isEndpoint && (n.data as StateNodeData).isEndpoint === isEndpoint) {
          return { ...n, data: { ...n.data, isEndpoint: undefined } as NodeData }
        }
        return n
      })
      commit({ nodes, edges: graph.edges })
    },

    setEditingNode: (id) => set({ editingNodeId: id }),

    patchNode: (id, patch) => {
      const graph = asGraph()
      if (!graph) return
      commit(updateNodeData(graph, id, patch))
    },

    addState: (fromId) => {
      const graph = asGraph()
      if (!graph) return
      const { graph: next, newNodeId } = addStateBefore(graph, fromId)
      commit(next)
      set({ editingNodeId: newNodeId })
    },

    addAction: (fromId) => {
      const graph = asGraph()
      if (!graph) return
      const { graph: next, newNodeId } = addActionBefore(graph, fromId)
      commit(next)
      set({ editingNodeId: newNodeId })
    },

    addSideFlow: (fromId, dir) => {
      const graph = asGraph()
      if (!graph) return
      const { graph: next, newNodeId } = addSideFlow(graph, fromId, dir)
      commit(next)
      set({ editingNodeId: newNodeId })
    },

    deleteNode: (id) => {
      const graph = asGraph()
      if (!graph) return
      commit(removeNode(graph, id))
      set({ editingNodeId: null })
    },

    applyNodeChanges: (changes) => {
      const current = get().current
      if (!current) return
      const nodes = applyNodeChanges(changes, current.nodes as never) as unknown as GraphNode[]
      set({ current: { ...current, nodes } })
      // Persist position/drag changes (not selection-only noise).
      if (changes.some((c) => c.type === 'position' || c.type === 'remove')) {
        scheduleAutosave(get)
      }
    },

    connect: (c) => {
      const graph = asGraph()
      if (!graph || !c.source || !c.target) return
      commit(connectNodes(graph, c.source, c.target))
    },

    saveAll: async () => {
      set({ saveAllState: 'loading' })
      // Flush the current plan first so the backup includes latest edits.
      const current = get().current
      if (current) await window.api.savePlan(serialize(current))
      const result = await window.api.saveAll()
      set({ saveAllState: 'done' })
      setTimeout(() => set({ saveAllState: 'idle' }), 5000)
      return result
    }
  }
})
