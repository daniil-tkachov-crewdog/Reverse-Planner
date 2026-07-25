import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { ActionNodeData } from '../../../shared/types'
import { STATUS_COLOR } from '../../../shared/types'
import { H } from '../../lib/graph'

export function ActionNodeView({ data, selected }: NodeProps): JSX.Element {
  const d = data as ActionNodeData
  const color = STATUS_COLOR[d.status]
  const dangling = (d as { _dangling?: boolean })._dangling === true
  return (
    <div
      className="action-node"
      style={{ borderColor: color, boxShadow: selected ? `0 0 0 2px ${color}` : undefined }}
      title={d.name}
    >
      <Handle id={H.targetLeft} type="target" position={Position.Left} className="rf-handle" />
      <Handle id={H.targetTop} type="target" position={Position.Top} className="rf-handle" />
      <Handle id={H.targetBottom} type="target" position={Position.Bottom} className="rf-handle" />
      <Handle id={H.sourceTop} type="source" position={Position.Top} className="rf-handle" />
      <Handle id={H.sourceBottom} type="source" position={Position.Bottom} className="rf-handle" />

      <div className="action-node__name">{d.name || 'Action'}</div>

      <Handle
        id={H.sourceRight}
        type="source"
        position={Position.Right}
        className={`rf-handle rf-handle--out${dangling ? ' rf-handle--connect' : ''}`}
      />
    </div>
  )
}
