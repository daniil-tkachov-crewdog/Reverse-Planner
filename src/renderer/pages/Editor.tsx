import { useMemo } from 'react'
import {
  Background,
  BackgroundVariant,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node
} from '@xyflow/react'
import { usePlanStore } from '../store/planStore'
import { StateNodeView } from '../components/canvas/StateNodeView'
import { ActionNodeView } from '../components/canvas/ActionNodeView'
import { GREY, H } from '../lib/graph'
import { EditorModals } from '../components/editors/EditorModals'
import type { StateNodeData } from '../../shared/types'

const nodeTypes = { stateNode: StateNodeView, actionNode: ActionNodeView }

export function Editor(): JSX.Element {
  const current = usePlanStore((s) => s.current)
  const applyChanges = usePlanStore((s) => s.applyNodeChanges)
  const connect = usePlanStore((s) => s.connect)
  const setEditingNode = usePlanStore((s) => s.setEditingNode)
  const defineEndpoint = usePlanStore((s) => s.defineEndpoint)

  // A node with no outgoing arrow is a dead end; Point B (the goal) is exempt.
  // Such nodes surface a draggable connector so they can be wired onward.
  const nodes = useMemo<Node[]>(() => {
    const withOutgoing = new Set((current?.edges ?? []).map((e) => e.source))
    return (current?.nodes ?? []).map((n) => {
      const isB = (n.data as StateNodeData).isEndpoint === 'B'
      const dangling = !withOutgoing.has(n.id) && !isB
      return { ...n, data: { ...n.data, _dangling: dangling } }
    }) as unknown as Node[]
  }, [current?.nodes, current?.edges])

  const edges = useMemo<Edge[]>(() => {
    return (current?.edges ?? []).map((e) => {
      const color = (e.data as { color?: string } | undefined)?.color ?? GREY
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? H.sourceRight,
        targetHandle: e.targetHandle ?? H.targetLeft,
        type: 'smoothstep',
        style: { stroke: color, strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 }
      }
    })
  }, [current?.edges])

  if (!current) return <div className="editor" />

  // Once the plan has any node, the endpoint scaffolding is dismissed for good.
  const isEmpty = current.nodes.length === 0

  return (
    <div className="editor">
      <div className="editor__canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={applyChanges}
          onConnect={connect}
          onNodeClick={(_e, node) => setEditingNode(node.id)}
          fitView
          fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#3a3a41" />
        </ReactFlow>
      </div>

      {isEmpty && (
        <div className="editor-empty">
          <div className="editor-empty__inner">
            <button className="endpoint-btn" onClick={() => defineEndpoint('B')}>
              Create Point B
            </button>
          </div>
        </div>
      )}

      <EditorModals />
    </div>
  )
}
