'use client'

import React from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { RBACHelper, Role, Permission } from '@/lib/rbac'

interface PermissionButtonProps extends ButtonProps {
  requiredPermissions: Permission[]
  userRole: Role
}

/**
 * PermissionButton component that only renders if user has required permissions
 */
export function PermissionButton({ 
  requiredPermissions, 
  userRole, 
  children,
  ...buttonProps 
}: PermissionButtonProps) {
  // Check if user has at least one of the required permissions
  const hasPermission = requiredPermissions.some(permission => 
    RBACHelper.hasPermission(userRole, permission)
  )

  if (!hasPermission) {
    return null
  }

  return (
    <Button {...buttonProps}>
      {children}
    </Button>
  )
}