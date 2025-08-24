import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  groups: string[]
  id: string
  email?: string
  name?: string
  createdAt?: number
  updatedAt?: number
}

export interface LoginResponse {
  tokens: {
    accessToken: string
    refreshToken: string
  }
  user: User
}

export interface Company {
  id: string
  name: string
  address: string
  phone: string
  email?: string
  website?: string
  status: 'ACTIVE' | 'DELETED'
  industry?: string
  description?: string
  logoUrl?: string
}

export interface AuthState {
  user: User | null
  loginResponse: LoginResponse | null
  selectedCompany: Company | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loginResponse: null,
  selectedCompany: null,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User; accessToken: string; selectedCompany?: Company }>) => {
      console.log('Redux setAuth called with:', action.payload)
      state.user = action.payload.user
      state.loginResponse = {
        tokens: {
          accessToken: action.payload.accessToken,
          refreshToken: '', // Not needed for this app
        },
        user: action.payload.user,
      }
      if (action.payload.selectedCompany) {
        state.selectedCompany = action.payload.selectedCompany
      }
      state.error = null
      console.log('Redux state after setAuth:', { user: state.user, hasAccessToken: !!state.loginResponse?.tokens.accessToken })
    },
    clearAuth: (state) => {
      state.user = null
      state.loginResponse = null
      state.selectedCompany = null
      state.error = null
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { setAuth, clearAuth, setError, clearError } = authSlice.actions
export default authSlice.reducer