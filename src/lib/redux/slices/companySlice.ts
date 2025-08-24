import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { mockAPI } from '@/lib/mockData'
import { CompanyService } from '@/services/companyService'

import { Company } from './authSlice'

interface CompanyState {
  companies: Company[]
  loading: boolean
  error: string | null
  selectedCompany: Company | null
}

const initialState: CompanyState = {
  companies: [],
  loading: false,
  error: null,
  selectedCompany: null,
}

export const fetchCompanies = createAsyncThunk(
  'company/fetchCompanies',
  async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL 
      const response = await fetch(`${apiUrl}/companies`)
      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      return Array.isArray(data) ? data : data.companies || []
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return await mockAPI.getCompanies()
    }
  }
)

export const fetchUserCompanies = createAsyncThunk(
  'company/fetchUserCompanies',
  async (token?: string) => {
    try {
      return await CompanyService.getUserCompanies(token)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return await mockAPI.getCompanies()
    }
  }
)

export const createCompany = createAsyncThunk(
  'company/createCompany',
  async (company: Omit<Company, 'id'>) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL 
      const response = await fetch(`${apiUrl}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(company),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to create company: ${response.status}`)
      }
      return response.json()
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return await mockAPI.createCompany(company)
    }
  }
)

export const updateCompany = createAsyncThunk(
  'company/updateCompany',
  async (company: Company) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL 
      const response = await fetch(`${apiUrl}/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(company),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to update company: ${response.status}`)
      }
      return response.json()
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return await mockAPI.updateCompany(company)
    }
  }
)

export const deleteCompany = createAsyncThunk(
  'company/deleteCompany',
  async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL 
      const response = await fetch(`${apiUrl}/companies/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to delete company: ${response.status}`)
      }
      return id
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      await mockAPI.deleteCompany(id)
      return id
    }
  }
)

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setSelectedCompany: (state, action: PayloadAction<Company | null>) => {
      state.selectedCompany = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false
        state.companies = action.payload
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch companies'
      })
      .addCase(fetchUserCompanies.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserCompanies.fulfilled, (state, action) => {
        state.loading = false
        state.companies = action.payload
      })
      .addCase(fetchUserCompanies.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch user companies'
      })
      .addCase(createCompany.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.loading = false
        state.companies.push(action.payload)
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create company'
      })
      .addCase(updateCompany.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.loading = false
        const index = state.companies.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.companies[index] = action.payload
        }
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update company'
      })
      .addCase(deleteCompany.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.loading = false
        state.companies = state.companies.filter(c => c.id !== action.payload)
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete company'
      })
  },
})

export const { setSelectedCompany, clearError } = companySlice.actions
export default companySlice.reducer