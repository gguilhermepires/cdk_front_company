'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, RefreshCw, X, Clock, CheckCircle, XCircle } from 'lucide-react'
import { CompanyService } from '@/services/companyService'
import { RBACHelper, Role } from '@/lib/rbac'
import { useAppSelector } from '@/lib/redux/hooks'
import { toast } from 'sonner'

interface Invitation {
  id: string;
  email: string;
  role: Role;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  invitedAt: string;
  expiresAt: string;
  invitedBy: string;
}

interface InvitationManagementPanelProps {
  companyId: string;
  userRole: Role;
}

export function InvitationManagementPanel({ companyId, userRole }: InvitationManagementPanelProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { token } = useAppSelector((state) => state.auth)

  const loadInvitations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Note: This would need to be implemented in CompanyService
      // For now, we'll use mock data or handle the API call
      const invitationsList = await CompanyService.getCompanyInvitations(companyId, token || undefined)
      setInvitations(invitationsList)
    } catch (err) {
      setError('Failed to load invitations')
      console.error('Error loading invitations:', err)
      
      // Mock data for development
      setInvitations([
        {
          id: '1',
          email: 'john.doe@example.com',
          role: 'ADMIN',
          status: 'PENDING',
          invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          invitedBy: 'current-user-id'
        },
        {
          id: '2',
          email: 'jane.smith@example.com',
          role: 'MEMBER',
          status: 'PENDING',
          invitedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          invitedBy: 'current-user-id'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (RBACHelper.hasPermission(userRole, 'MEMBER_INVITE')) {
      loadInvitations()
    }
  }, [companyId, userRole])

  const handleResendInvitation = async (invitationId: string, email: string) => {
    try {
      setError(null)
      
      // This would need to be implemented in CompanyService
      await CompanyService.resendInvitation(companyId, invitationId, token || undefined)
      
      toast.success(`Invitation resent to ${email}`)
      await loadInvitations()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to resend invitation'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleCancelInvitation = async (invitationId: string, email: string) => {
    try {
      setError(null)
      
      // This would need to be implemented in CompanyService
      await CompanyService.cancelInvitation(companyId, invitationId, token || undefined)
      
      toast.success(`Invitation to ${email} has been canceled`)
      await loadInvitations()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to cancel invitation'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const getStatusIcon = (status: Invitation['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />
      case 'DECLINED':
        return <XCircle className="h-4 w-4" />
      case 'EXPIRED':
        return <XCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Invitation['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'DECLINED':
        return 'bg-red-100 text-red-800'
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: Role) => {
    const roleInfo = RBACHelper.getRoleInfo(role)
    return (
      <Badge className={roleInfo.color}>
        {roleInfo.name}
      </Badge>
    )
  }

  const canManageInvitations = RBACHelper.hasPermission(userRole, 'MEMBER_INVITE')
  const pendingInvitations = invitations.filter(inv => inv.status === 'PENDING')
  const otherInvitations = invitations.filter(inv => inv.status !== 'PENDING')

  if (!canManageInvitations) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Alert>
            <AlertDescription>
              You don't have permission to manage invitations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Invitation Management</h2>
        </div>
        <Button 
          variant="outline" 
          onClick={loadInvitations}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Pending Invitations ({pendingInvitations.length})</span>
          </CardTitle>
          <CardDescription>
            Invitations that are waiting for a response
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading && invitations.length === 0 ? (
            <div className="p-6 text-center">Loading invitations...</div>
          ) : pendingInvitations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No pending invitations
            </div>
          ) : (
            <div className="divide-y">
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(invitation.status)}
                      <span className="font-medium">{invitation.email}</span>
                    </div>
                    {getRoleIcon(invitation.role)}
                    <Badge className={getStatusColor(invitation.status)}>
                      {invitation.status}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      <div>Invited {new Date(invitation.invitedAt).toLocaleDateString()}</div>
                      <div>Expires {new Date(invitation.expiresAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendInvitation(invitation.id, invitation.email)}
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Resend
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Invitation History */}
      {otherInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Invitation History</CardTitle>
            <CardDescription>
              Previously sent invitations and their status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {otherInvitations.slice(0, 5).map((invitation) => (
                <div key={invitation.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(invitation.status)}
                      <span className="font-medium">{invitation.email}</span>
                    </div>
                    {getRoleIcon(invitation.role)}
                    <Badge className={getStatusColor(invitation.status)}>
                      {invitation.status}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      <div>Invited {new Date(invitation.invitedAt).toLocaleDateString()}</div>
                      {invitation.status === 'EXPIRED' && (
                        <div>Expired {new Date(invitation.expiresAt).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {invitations.length === 0 && !loading && (
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <Mail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No invitations found</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}