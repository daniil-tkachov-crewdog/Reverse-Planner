import { usePlanStore } from '../../store/planStore'
import type { ActionNodeData, GraphNode } from '../../../shared/types'
import { Field, Modal, StatusSelect } from './common'
import { RichDescription } from './RichDescription'

export function ActionEditorModal({ node }: { node: GraphNode }): JSX.Element {
  const d = node.data as ActionNodeData
  const patchNode = usePlanStore((s) => s.patchNode)
  const addState = usePlanStore((s) => s.addState)
  const addAction = usePlanStore((s) => s.addAction)
  const addStateAfter = usePlanStore((s) => s.addStateAfter)
  const addActionAfter = usePlanStore((s) => s.addActionAfter)
  const deleteNode = usePlanStore((s) => s.deleteNode)
  const setEditingNode = usePlanStore((s) => s.setEditingNode)

  const actions = d.actions ?? []

  const updateAction = (i: number, value: string): void => {
    const next = [...actions]
    next[i] = value
    patchNode(node.id, { actions: next })
  }
  const addActionField = (): void => patchNode(node.id, { actions: [...actions, ''] })
  const removeActionField = (i: number): void =>
    patchNode(node.id, { actions: actions.filter((_, idx) => idx !== i) })

  return (
    <Modal
      title="Edit Action"
      onClose={() => setEditingNode(null)}
      edgeLeft={
        <>
          <button
            className="modal-edge-btn modal-edge-btn--primary"
            title="Add State (before)"
            onClick={() => addState(node.id)}
          >
            S
          </button>
          <button
            className="modal-edge-btn"
            title="Add Action (before)"
            onClick={() => addAction(node.id)}
          >
            A
          </button>
        </>
      }
      edgeRight={
        <>
          <button
            className="modal-edge-btn modal-edge-btn--primary"
            title="Add State (after)"
            onClick={() => addStateAfter(node.id)}
          >
            S
          </button>
          <button
            className="modal-edge-btn"
            title="Add Action (after)"
            onClick={() => addActionAfter(node.id)}
          >
            A
          </button>
        </>
      }
    >
      <Field label="Name">
        <input
          className="input"
          value={d.name}
          onChange={(e) => patchNode(node.id, { name: e.target.value })}
          placeholder="Name this action"
        />
      </Field>

      <Field label="Status">
        <StatusSelect value={d.status} onChange={(status) => patchNode(node.id, { status })} />
      </Field>

      <Field label="List of Actions">
        {actions.length === 0 && (
          <div style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 8 }}>
            No actions yet.
          </div>
        )}
        {actions.map((a, i) => (
          <div className="action-list__row" key={i}>
            <input
              className="input"
              value={a}
              onChange={(e) => updateAction(i, e.target.value)}
              placeholder={`Action ${i + 1}`}
            />
            <button className="mini-btn" title="Remove" onClick={() => removeActionField(i)}>
              ✕
            </button>
          </div>
        ))}
        <button className="mini-btn" onClick={addActionField}>
          + Add action
        </button>
      </Field>

      <Field label="Description">
        <RichDescription
          value={d.description}
          onChange={(html) => patchNode(node.id, { description: html })}
          placeholder="Describe this action in detail…"
        />
      </Field>

      <div className="field coming-soon">
        <label className="field__label">
          People <span className="coming-soon__tag">Coming soon</span>
        </label>
        <input className="input" disabled placeholder="Assign people…" />
      </div>

      <div className="field coming-soon">
        <label className="field__label">
          Resources <span className="coming-soon__tag">Coming soon</span>
        </label>
        <input className="input" disabled placeholder="Attach resources…" />
      </div>

      <div className="modal-actions">
        <button
          className="btn btn--ghost"
          style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
          onClick={() => deleteNode(node.id)}
        >
          Delete
        </button>
      </div>
    </Modal>
  )
}
