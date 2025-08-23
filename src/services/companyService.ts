import { Company } from '@/lib/redux/slices/companySlice'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export class CompanyService {
  private static getHeaders(token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  static async getAllCompanies(token?: string): Promise<Company[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/company/v1/companies`, {
        headers: this.getHeaders(token),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.statusText}`)
      }
      
      const data = await response.json()
      return Array.isArray(data) ? data : data.companies || []
    } catch (error) {
      console.error('Error fetching companies:', error)
      throw error
    }
  }

  static async getUserCompanies(token?: string): Promise<Company[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/company/v1/companies/user`, {
        headers: this.getHeaders(token),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user companies: ${response.statusText}`)
      }
      
      const data = await response.json()
      return Array.isArray(data) ? data : data.companies || []
    } catch (error) {
      console.error('Error fetching user companies:', error)
      throw error
    }
  }

  static async getCompanyById(id: string, token?: string): Promise<Company> {
    try {
      const response = await fetch(`${API_BASE_URL}/company/v1/companies/${id}`, {
        headers: this.getHeaders(token),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch company: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error)
      throw error
    }
  }

  static async createCompany(company: Omit<Company, 'id'>, token?: string): Promise<Company> {
    try {
      const response = await fetch(`${API_BASE_URL}/company/v1/companies`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(company),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to create company: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating company:', error)
      throw error
    }
  }

  static async updateCompany(company: Company, token?: string): Promise<Company> {
    try {
      const response = await fetch(`${API_BASE_URL}/company/v1/companies/${company.id}`, {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify(company),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to update company: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Error updating company ${company.id}:`, error)
      throw error
    }
  }

  static async deleteCompany(id: string, token?: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/company/v1/companies/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(token),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to delete company: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Error deleting company ${id}:`, error)
      throw error
    }
  }

  static async authenticateCompany(companyId: string, email: string, password: string): Promise<{
    token: string
    user: any
    company: Company
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/company/v1/companies/auth`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          companyId,
          email,
          password,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Authentication failed: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error authenticating company:', error)
      throw error
    }
  }
}