import { usePlanStore } from '../../store/planStore'
import { StateEditorModal } from './StateEditorModal'
import { ActionEditorModal } from './ActionEditorModal'

/** Renders whichever node editor is currently open (State or Action). */
export function EditorModals(): JSX.Element | null {
  const editingNodeId = usePlanStore((s) => s.editingNodeId)
  const current = usePlanStore((s) => s.current)

  if (!editingNodeId || !current) return null
  const node = current.nodes.find((n) => n.id === editingNodeId)
  if (!node) return null

  return node.type === 'actionNode' ? (
    <ActionEditorModal node={node} />
  ) : (
    <StateEditorModal node={node} />
  )
}
