import { usePlanStore } from '../store/planStore'
import { CheckIcon, SaveIcon } from './icons'

export function SaveAllButton(): JSX.Element {
  const state = usePlanStore((s) => s.saveAllState)
  const saveAll = usePlanStore((s) => s.saveAll)

  const onClick = (): void => {
    if (state !== 'idle') return
    void saveAll()
  }

  let className = 'btn'
  let content: JSX.Element
  if (state === 'loading') {
    className += ' saveall--loading'
    content = (
      <>
        <span className="spinner" />
        Saving…
      </>
    )
  } else if (state === 'done') {
    className += ' saveall--done'
    content = (
      <>
        <CheckIcon />
        Saved
      </>
    )
  } else {
    content = (
      <>
        <SaveIcon />
        Save All
      </>
    )
  }

  return (
    <button className={className} onClick={onClick} disabled={state === 'loading'} title="Back up all plans to Documents\\Reverse Planner">
      {content}
    </button>
  )
}
