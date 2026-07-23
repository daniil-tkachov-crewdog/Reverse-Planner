import { beforeEach, describe, expect, it } from 'vitest'
import {
  __resetIdCounter,
  addActionBefore,
  addSideFlow,
  addStateBefore,
  centerX,
  connectNodes,
  incomingEdge,
  makeStateNode,
  removeNode,
  updateNodeData,
  type Graph
} from './graph'
import { STATUS_COLOR } from '../../shared/types'

function endpointGraph(): { graph: Graph; aId: string; bId: string } {
  const a = makeStateNode(0, 0, { name: 'A', isEndpoint: 'A' })
  const b = makeStateNode(220, 0, { name: 'B', isEndpoint: 'B' })
  const graph = connectNodes({ nodes: [a, b], edges: [] }, a.id, b.id)
  return { graph, aId: a.id, bId: b.id }
}

beforeEach(() => __resetIdCounter())

describe('addActionBefore (action-first chaining)', () => {
  it('splices an action into the incoming edge of the target', () => {
    const { graph, aId, bId } = endpointGraph()
    const { graph: next, newNodeId } = addActionBefore(graph, bId)

    // A -> action, action -> B
    expect(incomingEdge(next, bId)?.source).toBe(newNodeId)
    expect(incomingEdge(next, newNodeId)?.source).toBe(aId)
    expect(next.nodes.find((n) => n.id === newNodeId)?.type).toBe('actionNode')
  })

  it('colors both edges touching the action by its status', () => {
    const { graph, bId } = endpointGraph()
    const { graph: next, newNodeId } = addActionBefore(graph, bId)
    const withStatus = updateNodeData(next, newNodeId, { status: 'in_progress' })

    const touching = withStatus.edges.filter(
      (e) => e.source === newNodeId || e.target === newNodeId
    )
    expect(touching.length).toBe(2)
    for (const e of touching) {
      expect((e.data as { color: string }).color).toBe(STATUS_COLOR.in_progress)
    }
  })
})

describe('addStateBefore', () => {
  it('inserts a state to the left and rewires the spine', () => {
    const { graph, aId, bId } = endpointGraph()
    const { graph: next, newNodeId } = addStateBefore(graph, bId)
    // A -> newState -> B
    expect(incomingEdge(next, bId)?.source).toBe(newNodeId)
    expect(incomingEdge(next, newNodeId)?.source).toBe(aId)
  })

  it('places the new node to the left of the reference', () => {
    const { graph, bId } = endpointGraph()
    const bx = centerX(graph.nodes.find((n) => n.id === bId)!)
    const { graph: next, newNodeId } = addStateBefore(graph, bId)
    expect(centerX(next.nodes.find((n) => n.id === newNodeId)!)).toBeLessThan(bx)
  })
})

describe('addSideFlow', () => {
  it('adds a state in a lane above and links it into the reference', () => {
    const { graph, bId } = endpointGraph()
    const { graph: next, newNodeId } = addSideFlow(graph, bId, 'top')
    const side = next.nodes.find((n) => n.id === newNodeId)!
    expect(side.position.y).toBeLessThan(0) // above the main line
    expect(incomingEdge(next, bId)?.source === newNodeId || next.edges.some((e) => e.source === newNodeId && e.target === bId)).toBe(true)
    expect((side.data as { lane: unknown }).lane).not.toBe('main')
  })

  it('places a bottom side flow below the main line', () => {
    const { graph, bId } = endpointGraph()
    const { graph: next, newNodeId } = addSideFlow(graph, bId, 'bottom')
    const side = next.nodes.find((n) => n.id === newNodeId)!
    expect(side.position.y).toBeGreaterThan(0)
  })
})

describe('removeNode', () => {
  it('heals the spine when a middle node is removed', () => {
    const { graph, aId, bId } = endpointGraph()
    const { graph: withState, newNodeId } = addStateBefore(graph, bId)
    const healed = removeNode(withState, newNodeId)
    // Back to A -> B
    expect(incomingEdge(healed, bId)?.source).toBe(aId)
    expect(healed.nodes.some((n) => n.id === newNodeId)).toBe(false)
  })
})

describe('connectNodes', () => {
  it('does not duplicate an existing edge', () => {
    const { graph, aId, bId } = endpointGraph()
    const again = connectNodes(graph, aId, bId)
    expect(again.edges.length).toBe(graph.edges.length)
  })

  it('ignores self connections', () => {
    const { graph, aId } = endpointGraph()
    expect(connectNodes(graph, aId, aId).edges.length).toBe(graph.edges.length)
  })
})
