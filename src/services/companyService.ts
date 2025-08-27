import { Company } from '@/lib/redux/slices/authSlice'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 

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
      const response = await fetch(`${API_BASE_URL}/companies`, {
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
      const response = await fetch(`${API_BASE_URL}/companies/user`, {
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
      const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/companies`, {
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
      const response = await fetch(`${API_BASE_URL}/companies/${company.id}`, {
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
      const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/companies/auth`, {
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

  // RBAC Member Management Methods

  static async getCompanyMembers(companyId: string, token?: string): Promise<Array<{
    userId: string;
    role: string;
    status: string;
    joinedAt: string;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/members`, {
        headers: this.getHeaders(token),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch company members: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.members || []
    } catch (error) {
      console.error(`Error fetching members for company ${companyId}:`, error)
      throw error
    }
  }

  static async manageMember(
    companyId: string,
    userId: string,
    action: 'ADD' | 'UPDATE_ROLE' | 'REMOVE',
    role?: 'OWNER' | 'ADMIN' | 'MEMBER',
    token?: string
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/members`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({
          companyId,
          userId,
          action,
          role,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to ${action.toLowerCase()} member: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Error managing member ${userId} for company ${companyId}:`, error)
      throw error
    }
  }

  static async inviteMember(
    companyId: string,
    email: string,
    role: 'ADMIN' | 'MEMBER' = 'MEMBER',
    message?: string,
    token?: string
  ): Promise<{ invitationId: string; expiresAt: string; invitationToken: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/invite`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({
          companyId,
          email,
          role,
          message,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to invite member: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Error inviting member to company ${companyId}:`, error)
      throw error
    }
  }

  static async acceptInvitation(token: string, authToken?: string): Promise<{ companyId: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/invitations/accept`, {
        method: 'POST',
        headers: this.getHeaders(authToken),
        body: JSON.stringify({ token }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to accept invitation: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error accepting invitation:', error)
      throw error
    }
  }

  static async transferOwnership(
    companyId: string,
    newOwnerId: string,
    token?: string
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/transfer-ownership`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ newOwnerId }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to transfer ownership: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Error transferring ownership for company ${companyId}:`, error)
      throw error
    }
  }

  // Invitation Management Methods

  static async getCompanyInvitations(companyId: string, token?: string): Promise<Array<{
    id: string;
    email: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
    invitedAt: string;
    expiresAt: string;
    invitedBy: string;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/invitations`, {
        headers: this.getHeaders(token),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch company invitations: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.invitations || []
    } catch (error) {
      console.error(`Error fetching invitations for company ${companyId}:`, error)
      throw error
    }
  }

  static async resendInvitation(companyId: string, invitationId: string, token?: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/invitations/${invitationId}/resend`, {
        method: 'POST',
        headers: this.getHeaders(token),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to resend invitation: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Error resending invitation ${invitationId} for company ${companyId}:`, error)
      throw error
    }
  }

  static async cancelInvitation(companyId: string, invitationId: string, token?: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}/invitations/${invitationId}/cancel`, {
        method: 'POST',
        headers: this.getHeaders(token),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to cancel invitation: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Error canceling invitation ${invitationId} for company ${companyId}:`, error)
      throw error
    }
  }
}