// Pure, framework-agnostic graph helpers for the reverse-planning canvas.
//
// Model: a plan is a chain of nodes ordered left (A / start) -> right (B / goal).
// Arrows point toward the goal (source = left, target = right). Actions are real
// nodes that live *between* two states; the arrow(s) touching an action take the
// action's status color. Building is "backward": every add inserts a node to the
// LEFT of the node whose editor is open, splicing into that node's incoming edge.

import {
  ACTION_DEFAULT,
  STATE_DEFAULT
} from './defaults'
import type {
  ActionNodeData,
  GraphEdge,
  GraphNode,
  NodeData,
  StateNodeData,
  Status
} from '../../shared/types'
import { STATUS_COLOR } from '../../shared/types'

export const STATE_SIZE = 140
export const ACTION_SIZE = 70
/** Horizontal distance between consecutive node centers. */
export const COL = 220
/** Vertical distance between lanes (main line vs. side flows). */
export const LANE_GAP = 220
export const GREY = STATUS_COLOR.not_reached

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

let idCounter = 0
let laneCounter = 0
export function genId(prefix: string): string {
  idCounter += 1
  return `${prefix}_${Date.now().toString(36)}_${idCounter}`
}

/** Test hook: make ids deterministic. */
export function __resetIdCounter(): void {
  idCounter = 0
  laneCounter = 0
}

export function sizeOf(node: GraphNode): { w: number; h: number } {
  const s = node.type === 'actionNode' ? ACTION_SIZE : STATE_SIZE
  return { w: s, h: s }
}

export function centerX(node: GraphNode): number {
  return node.position.x + sizeOf(node).w / 2
}

export function centerY(node: GraphNode): number {
  return node.position.y + sizeOf(node).h / 2
}

export function setCenter(node: GraphNode, cx: number, cy: number): GraphNode {
  const { w, h } = sizeOf(node)
  return { ...node, position: { x: cx - w / 2, y: cy - h / 2 } }
}

export function getNode(graph: Graph, id: string): GraphNode | undefined {
  return graph.nodes.find((n) => n.id === id)
}

/** The edge feeding INTO a node (target === nodeId). At most one on the spine. */
export function incomingEdge(graph: Graph, nodeId: string): GraphEdge | undefined {
  return graph.edges.find((e) => e.target === nodeId)
}

export function makeStateNode(
  cx: number,
  cy: number,
  data: Partial<StateNodeData> = {}
): GraphNode {
  const node: GraphNode = {
    id: genId('state'),
    type: 'stateNode',
    position: { x: 0, y: 0 },
    data: { ...STATE_DEFAULT, ...data, kind: 'state' } as StateNodeData
  }
  return setCenter(node, cx, cy)
}

export function makeActionNode(
  cx: number,
  cy: number,
  data: Partial<ActionNodeData> = {}
): GraphNode {
  const node: GraphNode = {
    id: genId('action'),
    type: 'actionNode',
    position: { x: 0, y: 0 },
    data: { ...ACTION_DEFAULT, ...data, kind: 'action' } as ActionNodeData
  }
  return setCenter(node, cx, cy)
}

/** Color every edge by the status of an action it touches (grey if none). */
export function recolorEdges(graph: Graph): Graph {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]))
  const edges = graph.edges.map((e) => {
    const src = byId.get(e.source)
    const tgt = byId.get(e.target)
    const action =
      src?.type === 'actionNode' ? src : tgt?.type === 'actionNode' ? tgt : undefined
    const color = action ? STATUS_COLOR[(action.data as ActionNodeData).status] : GREY
    return { ...e, data: { ...(e.data ?? {}), color } }
  })
  return { ...graph, edges }
}

function makeEdge(source: string, target: string): GraphEdge {
  return { id: genId('edge'), source, target, type: 'statusEdge', data: { color: GREY } }
}

/**
 * Insert `newNode` immediately to the LEFT of `refId`, splicing into refId's
 * incoming edge: an existing `L -> ref` becomes `L -> newNode -> ref`; with no
 * incoming edge it simply prepends `newNode -> ref`. Nodes left of ref are
 * shifted to make room. Returns the updated graph and the new node id.
 */
export function insertBefore(
  graph: Graph,
  refId: string,
  newNode: GraphNode
): { graph: Graph; newNodeId: string } {
  const ref = getNode(graph, refId)
  if (!ref) return { graph, newNodeId: newNode.id }

  const refCx = centerX(ref)
  const laneCy = centerY(ref)

  // Shift everything strictly left of ref to open a slot.
  const shifted = graph.nodes.map((n) =>
    centerX(n) < refCx ? setCenter(n, centerX(n) - COL, centerY(n)) : n
  )
  const placed = setCenter(newNode, refCx - COL, laneCy)

  const incoming = incomingEdge(graph, refId)
  let edges: GraphEdge[]
  if (incoming) {
    // L -> ref  becomes  L -> newNode, plus newNode -> ref
    edges = graph.edges.map((e) =>
      e.id === incoming.id ? { ...e, target: placed.id } : e
    )
    edges.push(makeEdge(placed.id, refId))
  } else {
    edges = [...graph.edges, makeEdge(placed.id, refId)]
  }

  const next = recolorEdges({ nodes: [...shifted, placed], edges })
  return { graph: next, newNodeId: placed.id }
}

/** Add a new State to the left of the given node (State or Action). */
export function addStateBefore(
  graph: Graph,
  refId: string,
  data?: Partial<StateNodeData>
): { graph: Graph; newNodeId: string } {
  const ref = getNode(graph, refId)
  const cy = ref ? centerY(ref) : 0
  return insertBefore(graph, refId, makeStateNode(0, cy, data))
}

/** Add a new Action to the left of a State (action-first chaining). */
export function addActionBefore(
  graph: Graph,
  refId: string,
  data?: Partial<ActionNodeData>
): { graph: Graph; newNodeId: string } {
  const ref = getNode(graph, refId)
  const cy = ref ? centerY(ref) : 0
  return insertBefore(graph, refId, makeActionNode(0, cy, data))
}

/**
 * Add a Side Flow (Plan-B fork) as a new State in a lane above ('top') or below
 * ('bottom') the reference node. The side state leads into the reference state
 * (sideState -> ref). Reconnecting it elsewhere on the main line is optional and
 * handled by manual connection on the canvas.
 */
export function addSideFlow(
  graph: Graph,
  refId: string,
  direction: 'top' | 'bottom',
  data?: Partial<StateNodeData>
): { graph: Graph; newNodeId: string } {
  const ref = getNode(graph, refId)
  if (!ref) return { graph, newNodeId: '' }

  const refCx = centerX(ref)
  const refCy = centerY(ref)
  const dir = direction === 'top' ? -1 : 1

  // Stack multiple side flows in the same direction so they don't overlap.
  const occupied = graph.nodes.filter((n) => {
    const dy = centerY(n) - refCy
    return Math.sign(dy) === dir && Math.abs(centerX(n) - refCx) < COL / 2
  }).length
  const cy = refCy + dir * LANE_GAP * (occupied + 1)

  laneCounter += 1
  const side = makeStateNode(refCx, cy, { ...data, lane: laneCounter })
  const edges = [...graph.edges, makeEdge(side.id, refId)]
  const next = recolorEdges({ nodes: [...graph.nodes, side], edges })
  return { graph: next, newNodeId: side.id }
}

/** Manually connect two nodes (e.g., wire a side flow back into the main line). */
export function connectNodes(
  graph: Graph,
  source: string,
  target: string
): Graph {
  if (source === target) return graph
  const exists = graph.edges.some((e) => e.source === source && e.target === target)
  if (exists) return graph
  return recolorEdges({ ...graph, edges: [...graph.edges, makeEdge(source, target)] })
}

/** Remove a node and any edges touching it, healing the spine where possible. */
export function removeNode(graph: Graph, nodeId: string): Graph {
  const incoming = graph.edges.find((e) => e.target === nodeId)
  const outgoing = graph.edges.find((e) => e.source === nodeId)
  let edges = graph.edges.filter((e) => e.source !== nodeId && e.target !== nodeId)
  // Heal: reconnect the left neighbor to the right neighbor.
  if (incoming && outgoing) {
    edges = [...edges, makeEdge(incoming.source, outgoing.target)]
  }
  const nodes = graph.nodes.filter((n) => n.id !== nodeId)
  return recolorEdges({ nodes, edges })
}

/** Update a node's data (immutably) and recolor edges if a status changed. */
export function updateNodeData(
  graph: Graph,
  nodeId: string,
  patch: Record<string, unknown>
): Graph {
  const nodes = graph.nodes.map((n) =>
    n.id === nodeId ? { ...n, data: { ...n.data, ...patch } as NodeData } : n
  )
  return recolorEdges({ ...graph, nodes })
}

/** Set the status color helper (used by tests / UI). */
export function statusColor(status: Status): string {
  return STATUS_COLOR[status]
}
