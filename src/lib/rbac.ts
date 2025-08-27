export type Role = 'OWNER' | 'ADMIN' | 'MEMBER';

export type Permission = 
  // Company Management
  | 'COMPANY_READ'
  | 'COMPANY_UPDATE'
  | 'COMPANY_DELETE'
  | 'COMPANY_TRANSFER_OWNERSHIP'
  
  // Member Management
  | 'MEMBER_READ'
  | 'MEMBER_INVITE'
  | 'MEMBER_REMOVE'
  | 'MEMBER_UPDATE_ROLE'
  
  // Role Management
  | 'ROLE_ASSIGN_ADMIN'
  | 'ROLE_ASSIGN_MEMBER'
  | 'ROLE_REMOVE_ADMIN'
  
  // System Operations
  | 'VIEW_AUDIT_LOGS'
  | 'MANAGE_COMPANY_SETTINGS';

// Default role permissions matching backend
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    'COMPANY_READ',
    'COMPANY_UPDATE', 
    'COMPANY_DELETE',
    'COMPANY_TRANSFER_OWNERSHIP',
    'MEMBER_READ',
    'MEMBER_INVITE',
    'MEMBER_REMOVE',
    'MEMBER_UPDATE_ROLE',
    'ROLE_ASSIGN_ADMIN',
    'ROLE_ASSIGN_MEMBER',
    'ROLE_REMOVE_ADMIN',
    'VIEW_AUDIT_LOGS',
    'MANAGE_COMPANY_SETTINGS'
  ],
  ADMIN: [
    'COMPANY_READ',
    'COMPANY_UPDATE',
    'MEMBER_READ',
    'MEMBER_INVITE',
    'MEMBER_REMOVE',
    'MEMBER_UPDATE_ROLE',
    'ROLE_ASSIGN_MEMBER',
    'MANAGE_COMPANY_SETTINGS'
  ],
  MEMBER: [
    'COMPANY_READ',
    'MEMBER_READ'
  ]
};

export class RBACHelper {
  /**
   * Check if a role has a specific permission
   */
  static hasPermission(role: Role, permission: Permission): boolean {
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Get all permissions for a role
   */
  static getPermissions(role: Role): Permission[] {
    return DEFAULT_ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Check if user can assign a specific role
   */
  static canAssignRole(userRole: Role, targetRole: Role): boolean {
    // Only OWNER can assign OWNER role
    if (targetRole === 'OWNER') {
      return userRole === 'OWNER';
    }

    // OWNER and ADMIN can assign ADMIN and MEMBER roles
    if (targetRole === 'ADMIN') {
      return userRole === 'OWNER' || userRole === 'ADMIN';
    }

    // Everyone with MEMBER_INVITE permission can assign MEMBER role
    if (targetRole === 'MEMBER') {
      return this.hasPermission(userRole, 'MEMBER_INVITE');
    }

    return false;
  }

  /**
   * Check if user can modify another user's role
   */
  static canModifyUserRole(actorRole: Role, targetCurrentRole: Role, targetNewRole?: Role): boolean {
    // Cannot modify OWNER unless you are OWNER
    if (targetCurrentRole === 'OWNER' && actorRole !== 'OWNER') {
      return false;
    }

    // If changing role, check if can assign new role
    if (targetNewRole && !this.canAssignRole(actorRole, targetNewRole)) {
      return false;
    }

    // Check base permission
    return this.hasPermission(actorRole, 'MEMBER_UPDATE_ROLE');
  }

  /**
   * Check if user can remove another user
   */
  static canRemoveUser(actorRole: Role, targetRole: Role): boolean {
    // Cannot remove OWNER unless you are OWNER
    if (targetRole === 'OWNER' && actorRole !== 'OWNER') {
      return false;
    }

    return this.hasPermission(actorRole, 'MEMBER_REMOVE');
  }

  /**
   * Get available roles that a user can assign
   */
  static getAssignableRoles(userRole: Role): Role[] {
    const assignableRoles: Role[] = [];
    
    if (this.canAssignRole(userRole, 'OWNER')) {
      assignableRoles.push('OWNER');
    }
    if (this.canAssignRole(userRole, 'ADMIN')) {
      assignableRoles.push('ADMIN');
    }
    if (this.canAssignRole(userRole, 'MEMBER')) {
      assignableRoles.push('MEMBER');
    }

    return assignableRoles;
  }

  /**
   * Get role display information
   */
  static getRoleInfo(role: Role): { name: string; color: string; description: string } {
    switch (role) {
      case 'OWNER':
        return {
          name: 'Owner',
          color: 'bg-red-100 text-red-800',
          description: 'Full access to company management, member management, and ownership transfer'
        };
      case 'ADMIN':
        return {
          name: 'Admin',
          color: 'bg-blue-100 text-blue-800',
          description: 'Company management and member management (cannot transfer ownership)'
        };
      case 'MEMBER':
        return {
          name: 'Member',
          color: 'bg-green-100 text-green-800',
          description: 'Read-only access to company information and member list'
        };
      default:
        return {
          name: 'Unknown',
          color: 'bg-gray-100 text-gray-800',
          description: 'Unknown role'
        };
    }
  }

  /**
   * Validate member action before execution
   */
  static validateMemberAction(
    actorRole: Role,
    action: 'ADD' | 'UPDATE_ROLE' | 'REMOVE',
    targetCurrentRole?: Role,
    targetNewRole?: Role
  ): { isValid: boolean; error?: string } {
    switch (action) {
      case 'ADD':
        if (!this.hasPermission(actorRole, 'MEMBER_INVITE')) {
          return { isValid: false, error: 'Insufficient permissions to invite members' };
        }
        if (targetNewRole && !this.canAssignRole(actorRole, targetNewRole)) {
          return { isValid: false, error: `Cannot assign role ${targetNewRole}` };
        }
        break;

      case 'UPDATE_ROLE':
        if (!targetCurrentRole || !targetNewRole) {
          return { isValid: false, error: 'Current and new roles are required' };
        }
        if (!this.canModifyUserRole(actorRole, targetCurrentRole, targetNewRole)) {
          return { isValid: false, error: 'Cannot modify this user\'s role' };
        }
        break;

      case 'REMOVE':
        if (!targetCurrentRole) {
          return { isValid: false, error: 'Target user role is required' };
        }
        if (!this.canRemoveUser(actorRole, targetCurrentRole)) {
          return { isValid: false, error: 'Cannot remove this user' };
        }
        break;

      default:
        return { isValid: false, error: 'Invalid action' };
    }

    return { isValid: true };
  }
}