import { contextBridge, ipcRenderer } from 'electron'
import type { Plan, SaveAllResult } from '../shared/types'

const api = {
  listPlans: (): Promise<Plan[]> => ipcRenderer.invoke('plans:list'),
  loadPlan: (id: string): Promise<Plan | null> => ipcRenderer.invoke('plans:load', id),
  savePlan: (plan: Plan): Promise<Plan> => ipcRenderer.invoke('plans:save', plan),
  deletePlan: (id: string): Promise<void> => ipcRenderer.invoke('plans:delete', id),
  saveAll: (): Promise<SaveAllResult> => ipcRenderer.invoke('plans:saveAll')
}

export type Api = typeof api

contextBridge.exposeInMainWorld('api', api)
