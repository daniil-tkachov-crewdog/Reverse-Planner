import { usePlanStore } from '../../store/planStore'
import type { GraphNode, StateNodeData } from '../../../shared/types'
import { Field, Modal, StatusSelect } from './common'
import { RichDescription } from './RichDescription'
import { ForkIcon } from '../icons'

export function StateEditorModal({ node }: { node: GraphNode }): JSX.Element {
  const d = node.data as StateNodeData
  const patchNode = usePlanStore((s) => s.patchNode)
  const setStateType = usePlanStore((s) => s.setStateType)
  const addState = usePlanStore((s) => s.addState)
  const addAction = usePlanStore((s) => s.addAction)
  const addStateAfter = usePlanStore((s) => s.addStateAfter)
  const addActionAfter = usePlanStore((s) => s.addActionAfter)
  const addSideFlow = usePlanStore((s) => s.addSideFlow)
  const deleteNode = usePlanStore((s) => s.deleteNode)
  const setEditingNode = usePlanStore((s) => s.setEditingNode)

  const title = d.isEndpoint ? `Point ${d.isEndpoint} — State` : 'Edit State'
  const typeValue = d.isEndpoint ?? 'step'

  // Point A → right only, Point B → left only, Plan Step → both sides.
  const showLeft = d.isEndpoint !== 'A'
  const showRight = d.isEndpoint !== 'B'

  const leftButtons = (
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
  )

  const rightButtons = (
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
  )

  return (
    <Modal
      title={title}
      onClose={() => setEditingNode(null)}
      titleAside={
        <select
          className="select type-select"
          value={typeValue}
          onChange={(e) => setStateType(node.id, e.target.value as 'A' | 'B' | 'step')}
          aria-label="State type"
        >
          <option value="A">Point A</option>
          <option value="step">Plan Step</option>
          <option value="B">Point B</option>
        </select>
      }
      edgeTop={
        <button
          className="modal-edge-btn"
          title="Add Side Flow (above)"
          onClick={() => addSideFlow(node.id, 'top')}
        >
          <ForkIcon up />
        </button>
      }
      edgeBottom={
        <button
          className="modal-edge-btn"
          title="Add Side Flow (below)"
          onClick={() => addSideFlow(node.id, 'bottom')}
        >
          <ForkIcon />
        </button>
      }
      edgeLeft={showLeft ? leftButtons : undefined}
      edgeRight={showRight ? rightButtons : undefined}
    >
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

      {!d.isEndpoint && (
        <div className="modal-actions">
          <button
            className="btn btn--ghost"
            style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
            onClick={() => deleteNode(node.id)}
          >
            Delete
          </button>
        </div>
      )}
    </Modal>
  )
}
