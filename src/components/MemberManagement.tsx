'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, UserPlus, Users, Crown, Shield, User } from 'lucide-react'
import { CompanyService } from '@/services/companyService'
import { RBACHelper, Role } from '@/lib/rbac'
import { useAppSelector } from '@/lib/redux/hooks'

interface Member {
  userId: string;
  role: Role;
  status: string;
  joinedAt: string;
}

interface MemberManagementProps {
  companyId: string;
  userRole: Role;
  currentUserId: string;
}

export function MemberManagement({ companyId, userRole, currentUserId }: MemberManagementProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('MEMBER')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [selectedMemberForTransfer, setSelectedMemberForTransfer] = useState<string>('')

  const { token } = useAppSelector((state) => state.auth)

  const loadMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      const membersList = await CompanyService.getCompanyMembers(companyId, token || undefined)
      setMembers(membersList)
    } catch (err) {
      setError('Failed to load company members')
      console.error('Error loading members:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (RBACHelper.hasPermission(userRole, 'MEMBER_READ')) {
      loadMembers()
    }
  }, [companyId, userRole])

  const handleInviteMember = async () => {
    if (!inviteEmail || !inviteRole) {
      setError('Email and role are required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const validation = RBACHelper.validateMemberAction(userRole, 'ADD', undefined, inviteRole)
      if (!validation.isValid) {
        setError(validation.error || 'Cannot invite member')
        return
      }

      await CompanyService.inviteMember(companyId, inviteEmail, inviteRole as 'ADMIN' | 'MEMBER', undefined, token || undefined)
      
      setInviteEmail('')
      setInviteRole('MEMBER')
      setInviteDialogOpen(false)
      
      // Reload members list
      await loadMembers()
    } catch (err: any) {
      setError(err.message || 'Failed to invite member')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMemberRole = async (memberId: string, currentRole: Role, newRole: Role) => {
    try {
      setLoading(true)
      setError(null)

      const validation = RBACHelper.validateMemberAction(userRole, 'UPDATE_ROLE', currentRole, newRole)
      if (!validation.isValid) {
        setError(validation.error || 'Cannot update member role')
        return
      }

      await CompanyService.manageMember(companyId, memberId, 'UPDATE_ROLE', newRole, token || undefined)
      await loadMembers()
    } catch (err: any) {
      setError(err.message || 'Failed to update member role')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string, memberRole: Role) => {
    try {
      setLoading(true)
      setError(null)

      const validation = RBACHelper.validateMemberAction(userRole, 'REMOVE', memberRole)
      if (!validation.isValid) {
        setError(validation.error || 'Cannot remove member')
        return
      }

      if (memberId === currentUserId && memberRole === 'OWNER') {
        const owners = members.filter(m => m.role === 'OWNER' && m.userId !== currentUserId)
        if (owners.length === 0) {
          setError('Cannot remove the last OWNER from company. Transfer ownership first.')
          return
        }
      }

      await CompanyService.manageMember(companyId, memberId, 'REMOVE', undefined, token || undefined)
      await loadMembers()
    } catch (err: any) {
      setError(err.message || 'Failed to remove member')
    } finally {
      setLoading(false)
    }
  }

  const handleTransferOwnership = async () => {
    if (!selectedMemberForTransfer) {
      setError('Please select a member to transfer ownership to')
      return
    }

    try {
      setLoading(true)
      setError(null)

      await CompanyService.transferOwnership(companyId, selectedMemberForTransfer, token || undefined)
      
      setTransferDialogOpen(false)
      setSelectedMemberForTransfer('')
      await loadMembers()
    } catch (err: any) {
      setError(err.message || 'Failed to transfer ownership')
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-4 w-4" />
      case 'ADMIN':
        return <Shield className="h-4 w-4" />
      case 'MEMBER':
        return <User className="h-4 w-4" />
    }
  }

  const assignableRoles = RBACHelper.getAssignableRoles(userRole)
  const canInvite = RBACHelper.hasPermission(userRole, 'MEMBER_INVITE')
  const canTransferOwnership = RBACHelper.hasPermission(userRole, 'COMPANY_TRANSFER_OWNERSHIP')

  if (!RBACHelper.hasPermission(userRole, 'MEMBER_READ')) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Alert>
            <AlertDescription>
              You don't have permission to view company members.
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
          <Users className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Company Members</h2>
        </div>
        
        <div className="flex space-x-2">
          {canInvite && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New Member</DialogTitle>
                  <DialogDescription>
                    Invite someone to join your company with a specific role.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="invite-role">Role</Label>
                    <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as Role)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableRoles.filter(role => role !== 'OWNER').map((role) => {
                          const roleInfo = RBACHelper.getRoleInfo(role)
                          return (
                            <SelectItem key={role} value={role}>
                              <div className="flex items-center space-x-2">
                                {getRoleIcon(role)}
                                <span>{roleInfo.name}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInviteMember} disabled={loading}>
                    {loading ? 'Inviting...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {canTransferOwnership && (
            <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Crown className="h-4 w-4 mr-2" />
                  Transfer Ownership
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Transfer Ownership</DialogTitle>
                  <DialogDescription>
                    Transfer ownership of this company to another member. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div>
                  <Label htmlFor="transfer-member">Select New Owner</Label>
                  <Select value={selectedMemberForTransfer} onValueChange={setSelectedMemberForTransfer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members
                        .filter(member => member.userId !== currentUserId && member.status === 'ACTIVE')
                        .map((member) => (
                          <SelectItem key={member.userId} value={member.userId}>
                            <div className="flex items-center space-x-2">
                              {getRoleIcon(member.role)}
                              <span>User {member.userId} ({RBACHelper.getRoleInfo(member.role).name})</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleTransferOwnership} 
                    disabled={loading}
                    variant="destructive"
                  >
                    {loading ? 'Transferring...' : 'Transfer Ownership'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading && members.length === 0 ? (
            <div className="p-6 text-center">Loading members...</div>
          ) : (
            <div className="divide-y">
              {members
                .filter(member => member.status === 'ACTIVE')
                .map((member) => {
                  const roleInfo = RBACHelper.getRoleInfo(member.role)
                  const canModifyRole = RBACHelper.canModifyUserRole(userRole, member.role)
                  const canRemove = RBACHelper.canRemoveUser(userRole, member.role)

                  return (
                    <div key={member.userId} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(member.role)}
                          <span className="font-medium">User {member.userId}</span>
                          {member.userId === currentUserId && (
                            <Badge variant="secondary">You</Badge>
                          )}
                        </div>
                        <Badge className={roleInfo.color}>
                          {roleInfo.name}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {canModifyRole && member.userId !== currentUserId && (
                          <Select
                            value={member.role}
                            onValueChange={(newRole: Role) => handleUpdateMemberRole(member.userId, member.role, newRole)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {assignableRoles.map((role) => {
                                const info = RBACHelper.getRoleInfo(role)
                                return (
                                  <SelectItem key={role} value={role}>
                                    <div className="flex items-center space-x-2">
                                      {getRoleIcon(role)}
                                      <span>{info.name}</span>
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        )}

                        {canRemove && member.userId !== currentUserId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.userId, member.role)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {members.length === 0 && !loading && (
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No members found</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}