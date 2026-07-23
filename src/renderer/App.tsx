import { useEffect } from 'react'
import { usePlanStore } from './store/planStore'
import { Header } from './components/Header'
import { Dashboard } from './pages/Dashboard'
import { Editor } from './pages/Editor'
import { Settings } from './pages/Settings'

export function App(): JSX.Element {
  const view = usePlanStore((s) => s.view)
  const init = usePlanStore((s) => s.init)

  useEffect(() => {
    void init()
  }, [init])

  return (
    <div className="app">
      <Header />
      {view === 'dashboard' && <Dashboard />}
      {view === 'editor' && <Editor />}
      {view === 'settings' && <Settings />}
    </div>
  )
}
