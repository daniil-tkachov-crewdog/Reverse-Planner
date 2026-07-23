import { usePlanStore } from '../store/planStore'
import { SaveAllButton } from './SaveAllButton'
import { SettingsIcon } from './icons'

export function Header(): JSX.Element {
  const view = usePlanStore((s) => s.view)
  const current = usePlanStore((s) => s.current)
  const goDashboard = usePlanStore((s) => s.goDashboard)
  const goSettings = usePlanStore((s) => s.goSettings)

  return (
    <header className="header">
      <div className="header__left">
        <button className="logo" onClick={() => void goDashboard()} title="Back to dashboard">
          Reverse Planner
        </button>
        {view === 'editor' && current && (
          <span style={{ color: 'var(--text-dim)' }}>/ {current.name}</span>
        )}
      </div>
      <div className="header__right">
        <SaveAllButton />
        <button className="icon-btn" onClick={goSettings} title="Settings" aria-label="Settings">
          <SettingsIcon />
        </button>
      </div>
    </header>
  )
}
