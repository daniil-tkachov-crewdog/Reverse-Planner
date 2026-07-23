import { usePlanStore } from '../../store/planStore'
import type { GraphNode, StateNodeData } from '../../../shared/types'
import { Field, Modal, StatusSelect } from './common'
import { RichDescription } from './RichDescription'

export function StateEditorModal({ node }: { node: GraphNode }): JSX.Element {
  const d = node.data as StateNodeData
  const patchNode = usePlanStore((s) => s.patchNode)
  const addState = usePlanStore((s) => s.addState)
  const addAction = usePlanStore((s) => s.addAction)
  const addSideFlow = usePlanStore((s) => s.addSideFlow)
  const deleteNode = usePlanStore((s) => s.deleteNode)
  const setEditingNode = usePlanStore((s) => s.setEditingNode)

  const title = d.isEndpoint
    ? `Point ${d.isEndpoint} — State`
    : 'Edit State'

  return (
    <Modal title={title} onClose={() => setEditingNode(null)}>
      {/* Top side-flow button */}
      <div className="modal-actions__row">
        <button className="btn btn--ghost" onClick={() => addSideFlow(node.id, 'top')}>
          ↑ Add Side Flow (above)
        </button>
      </div>

      <Field label="Name">
        <input
          className="input"
          value={d.name}
          onChange={(e) => patchNode(node.id, { name: e.target.value })}
          placeholder="Name this state"
        />
      </Field>

      <Field label="Status">
        <StatusSelect value={d.status} onChange={(status) => patchNode(node.id, { status })} />
      </Field>

      <Field label="Description">
        <RichDescription
          value={d.description}
          onChange={(html) => patchNode(node.id, { description: html })}
          placeholder="Describe this state in detail…"
        />
      </Field>

      <div className="modal-actions">
        <div className="modal-actions__main">
          <div className="modal-actions__left">
            <button className="btn btn--primary" onClick={() => addState(node.id)}>
              + Add State
            </button>
            <button className="btn" onClick={() => addAction(node.id)}>
              + Add Action
            </button>
          </div>
          {!d.isEndpoint && (
            <button
              className="btn btn--ghost"
              style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
              onClick={() => deleteNode(node.id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Bottom side-flow button */}
      <div className="modal-actions__row">
        <button className="btn btn--ghost" onClick={() => addSideFlow(node.id, 'bottom')}>
          ↓ Add Side Flow (below)
        </button>
      </div>
    </Modal>
  )
}
