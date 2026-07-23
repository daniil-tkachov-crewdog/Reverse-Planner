import { promises as fs } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Isolated temp dirs standing in for Electron's userData / documents paths.
let userDataDir: string
let documentsDir: string

vi.mock('electron', () => ({
  app: {
    getPath: (name: string) => (name === 'documents' ? documentsDir : userDataDir)
  }
}))

import { listPlans, loadPlan, saveAll, savePlan, deletePlan } from './storage'
import type { Plan } from '../shared/types'

function samplePlan(id: string, name: string): Plan {
  const now = new Date().toISOString()
  return { id, name, createdAt: now, updatedAt: now, nodes: [], edges: [] }
}

beforeEach(async () => {
  const base = await fs.mkdtemp(join(tmpdir(), 'rp-'))
  userDataDir = join(base, 'userData')
  documentsDir = join(base, 'documents')
  await fs.mkdir(userDataDir, { recursive: true })
  // Note: intentionally do NOT create documentsDir — saveAll must create it.
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('plan persistence', () => {
  it('round-trips a plan through save/load', async () => {
    const plan = samplePlan('plan_1', 'My Plan')
    await savePlan(plan)
    const loaded = await loadPlan('plan_1')
    expect(loaded?.name).toBe('My Plan')
  })

  it('lists saved plans newest-first and deletes', async () => {
    await savePlan({ ...samplePlan('a', 'A'), updatedAt: '2024-01-01T00:00:00Z' })
    await savePlan({ ...samplePlan('b', 'B'), updatedAt: '2025-01-01T00:00:00Z' })
    let plans = await listPlans()
    expect(plans.map((p) => p.id)).toEqual(['b', 'a'])
    await deletePlan('a')
    plans = await listPlans()
    expect(plans.map((p) => p.id)).toEqual(['b'])
  })
})

describe('saveAll (Documents backup)', () => {
  it('creates the missing Reverse Planner folder and writes every plan', async () => {
    await savePlan(samplePlan('p1', 'One'))
    await savePlan(samplePlan('p2', 'Two'))

    const result = await saveAll()

    expect(result.ok).toBe(true)
    expect(result.count).toBe(2)
    const backupFolder = join(documentsDir, 'Reverse Planner')
    const files = await fs.readdir(backupFolder)
    expect(files.sort()).toEqual(['p1.json', 'p2.json'])
  })

  it('recreates the folder even if it was deleted between saves', async () => {
    await savePlan(samplePlan('p1', 'One'))
    await saveAll()
    await fs.rm(join(documentsDir, 'Reverse Planner'), { recursive: true, force: true })

    const result = await saveAll()
    expect(result.ok).toBe(true)
    const files = await fs.readdir(join(documentsDir, 'Reverse Planner'))
    expect(files).toContain('p1.json')
  })
})
