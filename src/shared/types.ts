// Shared domain types used by both the Electron main process (persistence)
// and the renderer (React Flow graph). Keep this framework-agnostic.

export type Status = 'not_reached' | 'in_progress' | 'done' | 'failed'

export const STATUS_ORDER: Status[] = ['not_reached', 'in_progress', 'done', 'failed']

export const STATUS_LABEL: Record<Status, string> = {
  not_reached: 'Not reached',
  in_progress: 'In progress',
  done: 'Done',
  failed: 'Failed'
}

export const STATUS_COLOR: Record<Status, string> = {
  not_reached: '#6b7280', // grey
  in_progress: '#f59e0b', // amber
  done: '#22c55e', // green
  failed: '#ef4444' // red
}

export interface StateNodeData {
  kind: 'state'
  name: string
  status: Status
  /** Rich description stored as HTML so bullet points survive round-trips. */
  description: string
  /** Marks the plan's start (A) or goal (B). */
  isEndpoint?: 'A' | 'B'
  /** 'main' for the A->B baseline, or a numeric lane id for a side flow. */
  lane: 'main' | number
  [key: string]: unknown
}

export interface ActionNodeData {
  kind: 'action'
  name: string
  status: Status
  /** The "List of Actions" — one string per field. */
  actions: string[]
  description: string
  [key: string]: unknown
}

export type NodeData = StateNodeData | ActionNodeData

export interface GraphNode {
  id: string
  type: 'stateNode' | 'actionNode'
  position: { x: number; y: number }
  data: NodeData
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type?: string
  /** Named handles so side-flow arrows can attach to a node's top/bottom. */
  sourceHandle?: string
  targetHandle?: string
  /** id of the Action node whose status colors this edge, if any. */
  actionId?: string
  [key: string]: unknown
}

export interface Plan {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface SaveAllResult {
  ok: boolean
  folder: string
  count: number
  error?: string
}
