import type { Plan } from '../../shared/types'
import { genId } from './graph'

export function createEmptyPlan(name = 'Untitled Plan'): Plan {
  const now = new Date().toISOString()
  return {
    id: genId('plan'),
    name,
    createdAt: now,
    updatedAt: now,
    nodes: [],
    edges: []
  }
}

/** True once both endpoints A and B exist in the plan. */
export function hasEndpoint(plan: Plan, which: 'A' | 'B'): boolean {
  return plan.nodes.some(
    (n) => n.type === 'stateNode' && (n.data as { isEndpoint?: string }).isEndpoint === which
  )
}
