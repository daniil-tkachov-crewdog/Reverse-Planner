import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { ActionNodeData } from '../../../shared/types'
import { STATUS_COLOR } from '../../../shared/types'

export function ActionNodeView({ data, selected }: NodeProps): JSX.Element {
  const d = data as ActionNodeData
  const color = STATUS_COLOR[d.status]
  return (
    <div
      className="action-node"
      style={{ borderColor: color, boxShadow: selected ? `0 0 0 2px ${color}` : undefined }}
      title={d.name}
    >
      <Handle type="target" position={Position.Left} className="rf-handle" />
      <div className="action-node__name">{d.name || 'Action'}</div>
      <Handle type="source" position={Position.Right} className="rf-handle" />
    </div>
  )
}
