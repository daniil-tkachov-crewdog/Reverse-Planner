import { usePlanStore } from '../store/planStore'
import type { Plan, StateNodeData } from '../../shared/types'
import { STATUS_COLOR, STATUS_LABEL } from '../../shared/types'

function goalStatus(plan: Plan): { label: string; color: string } {
  const goal = plan.nodes.find(
    (n) => n.type === 'stateNode' && (n.data as StateNodeData).isEndpoint === 'B'
  )
  const status = goal ? (goal.data as StateNodeData).status : 'not_reached'
  return { label: STATUS_LABEL[status], color: STATUS_COLOR[status] }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function Dashboard(): JSX.Element {
  const plans = usePlanStore((s) => s.plans)
  const createPlan = usePlanStore((s) => s.createPlan)
  const openPlan = usePlanStore((s) => s.openPlan)
  const deletePlan = usePlanStore((s) => s.deletePlan)

  return (
    <div className="dashboard">
      <div className="dashboard__head">
        <div>
          <h1 className="dashboard__title">Your Plans</h1>
          <p className="dashboard__subtitle">
            Plan backwards from your goal. Start with a fresh plan and define points A and B.
          </p>
        </div>
        <button className="btn btn--primary" onClick={() => void createPlan()}>
          + Create a Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="plan-grid">
          <button className="plan-card plan-card--new" onClick={() => void createPlan()}>
            <span className="plan-card__plus">+</span>
            Create your first plan
          </button>
        </div>
      ) : (
        <div className="plan-grid">
          {plans.map((plan) => {
            const g = goalStatus(plan)
            const nodeCount = plan.nodes.length
            return (
              <button
                key={plan.id}
                className="plan-card"
                onClick={() => void openPlan(plan.id)}
              >
                <span
                  className="plan-card__delete"
                  role="button"
                  tabIndex={0}
                  aria-label="Delete plan"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Delete "${plan.name}"? This cannot be undone.`)) {
                      void deletePlan(plan.id)
                    }
                  }}
                >
                  ✕
                </span>
                <div className="plan-card__name">{plan.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                  <span className="status-dot" style={{ background: g.color }} />
                  Goal: {g.label}
                </div>
                <div className="plan-card__meta">
                  {nodeCount} node{nodeCount === 1 ? '' : 's'} · Updated {formatDate(plan.updatedAt)}
                </div>
              </button>
            )
          })}
          <button className="plan-card plan-card--new" onClick={() => void createPlan()}>
            <span className="plan-card__plus">+</span>
            Create a Plan
          </button>
        </div>
      )}
    </div>
  )
}
