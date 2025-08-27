import { Role } from '@/lib/rbac'

/**
 * Role Testing Helper - Utility functions for testing different user roles
 * This file is for development/testing purposes only
 */

export interface MockUserContext {
  id: string
  role: Role
  companyId: string
}

export const MOCK_USER_CONTEXTS: Record<string, MockUserContext> = {
  OWNER: {
    id: 'owner-user-id',
    role: 'OWNER',
    companyId: 'test-company-id'
  },
  ADMIN: {
    id: 'admin-user-id', 
    role: 'ADMIN',
    companyId: 'test-company-id'
  },
  MEMBER: {
    id: 'member-user-id',
    role: 'MEMBER', 
    companyId: 'test-company-id'
  }
}

/**
 * Get mock user context for testing specific role behaviors
 */
export function getMockUserContext(role: Role): MockUserContext {
  return MOCK_USER_CONTEXTS[role]
}

/**
 * Role testing scenarios for manual verification
 */
export const ROLE_TEST_SCENARIOS = {
  OWNER: {
    description: 'OWNER role should have access to all tabs and all management functions',
    expectedBehavior: {
      visibleTabs: ['Company Management', 'Member Management', 'Financial Dashboard'],
      companyManagement: {
        canCreate: true,
        canEdit: true, 
        canDelete: true
      },
      memberManagement: {
        canViewMembers: true,
        canInviteMembers: true,
        canManageRoles: true,
        canRemoveMembers: true,
        canTransferOwnership: true
      },
      financialDashboard: {
        canView: true,
        canManageFinances: true
      }
    }
  },
  ADMIN: {
    description: 'ADMIN role should have access to Company Management and Member Management tabs',
    expectedBehavior: {
      visibleTabs: ['Company Management', 'Member Management', 'Financial Dashboard'],
      companyManagement: {
        canCreate: false,
        canEdit: true,
        canDelete: false
      },
      memberManagement: {
        canViewMembers: true,
        canInviteMembers: true,
        canManageRoles: true,
        canRemoveMembers: true,
        canTransferOwnership: false
      },
      financialDashboard: {
        canView: true,
        canManageFinances: true
      }
    }
  },
  MEMBER: {
    description: 'MEMBER role should have access only to Company Management tab (read-only)',
    expectedBehavior: {
      visibleTabs: ['Company Management', 'Financial Dashboard'],
      companyManagement: {
        canCreate: false,
        canEdit: false,
        canDelete: false
      },
      memberManagement: {
        canViewMembers: true,
        canInviteMembers: false,
        canManageRoles: false,
        canRemoveMembers: false,
        canTransferOwnership: false
      },
      financialDashboard: {
        canView: true,
        canManageFinances: true
      }
    }
  }
}

/**
 * Utility to log role testing information for debugging
 */
export function logRoleTestingInfo(currentRole: Role) {
  const scenario = ROLE_TEST_SCENARIOS[currentRole]
  console.group(`🧪 Role Testing - ${currentRole}`)
  console.log('Description:', scenario.description)
  console.log('Expected Behavior:', scenario.expectedBehavior)
  console.log('Mock User Context:', getMockUserContext(currentRole))
  console.groupEnd()
}