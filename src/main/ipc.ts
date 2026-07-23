import { ipcMain } from 'electron'
import type { Plan } from '../shared/types'
import { deletePlan, listPlans, loadPlan, saveAll, savePlan } from './storage'

/** Register all IPC handlers. Channel names mirror window.api in the preload. */
export function registerIpc(): void {
  ipcMain.handle('plans:list', () => listPlans())
  ipcMain.handle('plans:load', (_e, id: string) => loadPlan(id))
  ipcMain.handle('plans:save', (_e, plan: Plan) => savePlan(plan))
  ipcMain.handle('plans:delete', (_e, id: string) => deletePlan(id))
  ipcMain.handle('plans:saveAll', () => saveAll())
}
