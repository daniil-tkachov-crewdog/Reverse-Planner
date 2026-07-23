import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { StateNodeData } from '../../../shared/types'
import { STATUS_COLOR, STATUS_LABEL } from '../../../shared/types'

export function StateNodeView({ data, selected }: NodeProps): JSX.Element {
  const d = data as StateNodeData
  const color = STATUS_COLOR[d.status]
  return (
    <div
      className={`state-node${d.isEndpoint ? ' state-node--endpoint' : ''}`}
      style={{ borderColor: color, boxShadow: selected ? `0 0 0 2px ${color}` : undefined }}
    >
      <Handle type="target" position={Position.Left} className="rf-handle" />
      {d.isEndpoint && <div className="state-node__badge">Point {d.isEndpoint}</div>}
      <div className="state-node__name">{d.name || 'Untitled'}</div>
      <div className="state-node__status">
        <span className="status-dot" style={{ background: color }} />
        {STATUS_LABEL[d.status]}
      </div>
      <Handle type="source" position={Position.Right} className="rf-handle" />
    </div>
  )
}
