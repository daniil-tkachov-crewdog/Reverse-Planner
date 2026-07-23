import { app } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'
import type { Plan, SaveAllResult } from '../shared/types'

/** Directory where plans are auto-persisted between launches. */
function plansDir(): string {
  return join(app.getPath('userData'), 'plans')
}

/** The "Save All" backup folder: Documents\Reverse Planner. */
function backupDir(): string {
  return join(app.getPath('documents'), 'Reverse Planner')
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true })
}

function safeFileName(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json'
}

export async function listPlans(): Promise<Plan[]> {
  const dir = plansDir()
  await ensureDir(dir)
  const entries = await fs.readdir(dir)
  const plans: Plan[] = []
  for (const entry of entries) {
    if (!entry.endsWith('.json')) continue
    try {
      const raw = await fs.readFile(join(dir, entry), 'utf-8')
      plans.push(JSON.parse(raw) as Plan)
    } catch {
      // Skip unreadable / corrupt files rather than crashing the dashboard.
    }
  }
  // Newest first.
  plans.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  return plans
}

export async function loadPlan(id: string): Promise<Plan | null> {
  try {
    const raw = await fs.readFile(join(plansDir(), safeFileName(id)), 'utf-8')
    return JSON.parse(raw) as Plan
  } catch {
    return null
  }
}

export async function savePlan(plan: Plan): Promise<Plan> {
  const dir = plansDir()
  await ensureDir(dir)
  const toSave: Plan = { ...plan, updatedAt: new Date().toISOString() }
  await fs.writeFile(
    join(dir, safeFileName(plan.id)),
    JSON.stringify(toSave, null, 2),
    'utf-8'
  )
  return toSave
}

export async function deletePlan(id: string): Promise<void> {
  try {
    await fs.unlink(join(plansDir(), safeFileName(id)))
  } catch {
    // Already gone — nothing to do.
  }
}

/**
 * Save All (function 1): write every plan as JSON into Documents\Reverse Planner.
 * If the target folder is missing it is (re)created, then everything is saved.
 */
export async function saveAll(): Promise<SaveAllResult> {
  const folder = backupDir()
  try {
    await ensureDir(folder)
    const plans = await listPlans()
    for (const plan of plans) {
      await fs.writeFile(
        join(folder, safeFileName(plan.id)),
        JSON.stringify(plan, null, 2),
        'utf-8'
      )
    }
    return { ok: true, folder, count: plans.length }
  } catch (err) {
    return {
      ok: false,
      folder,
      count: 0,
      error: err instanceof Error ? err.message : String(err)
    }
  }
}
