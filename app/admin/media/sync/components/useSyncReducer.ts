import { useReducer } from 'react'
import type { SyncState, SyncAction } from './types'

const initialState: SyncState = {
  direction: null,
  status: 'idle',
  progress: { current: 0, total: 0 },
  stats: null,
  completionData: null
}

function syncReducer(state: SyncState, action: SyncAction): SyncState {
  switch (action.type) {
    case 'SET_DIRECTION':
      return { ...state, direction: action.payload }
    case 'SET_STATUS':
      return { ...state, status: action.payload }
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload }
    case 'SET_STATS':
      return { ...state, stats: action.payload }
    case 'SET_COMPLETION':
      return { ...state, completionData: action.payload }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export const useSyncReducer = () => {
  return useReducer(syncReducer, initialState)
}