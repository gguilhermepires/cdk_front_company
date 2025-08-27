'use client'

import React from 'react'
import { RBACHelper, Role, Permission } from '@/lib/rbac'

interface RoleGuardProps {
  requiredPermissions: Permission[]
  userRole: Role
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * RoleGuard component that conditionally renders content based on user permissions
 */
export function RoleGuard({ 
  requiredPermissions, 
  userRole, 
  children, 
  fallback = null 
}: RoleGuardProps) {
  // Check if user has at least one of the required permissions
  const hasPermission = requiredPermissions.some(permission => 
    RBACHelper.hasPermission(userRole, permission)
  )

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}