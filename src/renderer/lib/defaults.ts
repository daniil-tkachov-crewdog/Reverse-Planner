import type { ActionNodeData, StateNodeData } from '../../shared/types'

export const STATE_DEFAULT: StateNodeData = {
  kind: 'state',
  name: 'New State',
  status: 'not_reached',
  description: '',
  lane: 'main'
}

export const ACTION_DEFAULT: ActionNodeData = {
  kind: 'action',
  name: 'New Action',
  status: 'not_reached',
  actions: [],
  description: ''
}
