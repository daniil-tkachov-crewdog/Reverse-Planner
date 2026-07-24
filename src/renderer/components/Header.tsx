import { usePlanStore } from '../store/planStore'
import { SaveAllButton } from './SaveAllButton'
import { ArrowLeftIcon, SettingsIcon } from './icons'

export function Header(): JSX.Element {
  const view = usePlanStore((s) => s.view)
  const current = usePlanStore((s) => s.current)
  const goDashboard = usePlanStore((s) => s.goDashboard)
  const goSettings = usePlanStore((s) => s.goSettings)
  const goBack = usePlanStore((s) => s.goBack)
  const renamePlan = usePlanStore((s) => s.renamePlan)

  const onSettings = view === 'settings'

  return (
    <header className="header">
      <div className="header__left">
        <button className="logo" onClick={() => void goDashboard()} title="Back to dashboard">
          Reverse Planner
        </button>
        {view === 'editor' && current && (
          <>
            <span style={{ color: 'var(--text-dim)' }}>/</span>
            <input
              className="plan-name-input"
              value={current.name}
              onChange={(e) => renamePlan(e.target.value)}
              placeholder="Untitled Plan"
              aria-label="Plan name"
            />
          </>
        )}
      </div>
      <div className="header__right">
        <SaveAllButton />
        {onSettings ? (
          <button className="icon-btn" onClick={goBack} title="Back" aria-label="Back">
            <ArrowLeftIcon />
          </button>
        ) : (
          <button className="icon-btn" onClick={goSettings} title="Settings" aria-label="Settings">
            <SettingsIcon />
          </button>
        )}
      </div>
    </header>
  )
}
