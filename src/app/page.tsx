'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Building2, Users, Wallet } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CompanyForm } from '@/components/CompanyForm'
import { MemberManagement } from '@/components/MemberManagement'
import { InvitationManagementPanel } from '@/components/InvitationManagementPanel'
import { RoleGuard } from '@/components/RoleGuard'
import FinancialDashboard from '@/components/FinancialDashboard'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { setSelectedCompany } from '@/lib/redux/slices/companySlice'
import { Company } from '@/lib/redux/slices/authSlice'
import { CompanyService } from '@/services/companyService'
import { RootState } from '@/lib/redux/store'
import { RBACHelper, Role } from '@/lib/rbac'
import { toast } from 'sonner'

/**
 * CompanyManagement - Main business management interface with role-based access control
 * 
 * Features:
 * - Tabbed interface with Company Management, Member Management, and Financial Dashboard
 * - Role-based tab visibility and action permissions
 * - Responsive design with mobile-first approach
 * 
 * Role Access Matrix:
 * - OWNER: All tabs, all permissions (create/edit/delete companies, manage members, transfer ownership)
 * - ADMIN: Company + Member + Financial tabs, limited permissions (no company delete, no ownership transfer)
 * - MEMBER: Company + Financial tabs only, read-only company access, no member management
 */
export default function CompanyManagement() {
  const dispatch = useAppDispatch()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCompany, setSelectedCompanyLocal] = useState<Company | null>(null)
  const [activeTab, setActiveTab] = useState('companies')
  
  const user = useAppSelector((state: RootState) => state.auth.user);
  const accessToken = useAppSelector((state: RootState) => state.auth.loginResponse?.tokens.accessToken);
  
  // TODO: In production, get user role from authentication context or API
  // For testing, you can change this value to test different role behaviors:
  // - 'OWNER': Full access to all tabs and management functions
  // - 'ADMIN': Access to Company and Member Management, limited permissions  
  // - 'MEMBER': Read-only access to Company Management, no Member Management access
  const userRole: Role = 'OWNER' // Change this to test different roles: 'OWNER' | 'ADMIN' | 'MEMBER'
  const currentUserId = user?.id || ''
  const currentCompanyId = companies[0]?.id || '' // Use first company or get from context

  // Debug current auth state
  console.log("Company app current state:", { user, accessToken, hasLoginResponse: !!useAppSelector(state => state.auth.loginResponse) });
  console.log("UUser selected:", user);

  useEffect(() => {
    const loadUserCompanies = async () => {
      try {
        setLoading(true)
        setError('')

        if (!accessToken) {
          setError('Access token not available. Please login again.')
          return
        }

        const fetchedCompanies = await CompanyService.getUserCompanies(accessToken)
        setCompanies(fetchedCompanies)

        if (fetchedCompanies.length === 0) {
          setError('You do not have access to any companies. Please contact your administrator.')
        }
      } catch (err) {
        console.error('Failed to load user companies:', err)
        if (err instanceof Error && err.message.includes('401')) {
          setError('Authentication expired. Please login again.')
        } else {
          setError('Failed to load your companies. Please try again later.')
        }
      } finally {
        setLoading(false)
      }
    }

    // Only load companies if we have an access token and haven't loaded yet
    if (accessToken && companies.length === 0 && !error) {
      loadUserCompanies()
    }
  }, [accessToken, companies.length, error])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.phone.includes(searchTerm) ||
    (company.email && company.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleEdit = (company: Company) => {
    setSelectedCompanyLocal(company)
    dispatch(setSelectedCompany(company))
    setShowEditDialog(true)
  }

  const handleDeleteClick = (company: Company) => {
    setSelectedCompanyLocal(company)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (selectedCompany) {
      try {
        await CompanyService.deleteCompany(selectedCompany.id, accessToken)
        setCompanies(companies.filter((c) => c.id !== selectedCompany.id))
        toast.success('Company deleted successfully')
        setShowDeleteDialog(false)
        setSelectedCompanyLocal(null)
      } catch (error) {
        toast.error('Failed to delete company')
      }
    }
  }

  const handleCloseDialogs = () => {
    setShowCreateDialog(false)
    setShowEditDialog(false)
    setShowDeleteDialog(false)
    setSelectedCompanyLocal(null)
    dispatch(setSelectedCompany(null))
  }

  // Determine which tabs are visible based on user role
  const canAccessMemberManagement = RBACHelper.hasPermission(userRole, 'MEMBER_READ')
  const canAccessFinancialDashboard = true // All roles can access financial dashboard

  if (loading && companies.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading companies...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">Business Management</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${canAccessMemberManagement ? 'grid-cols-3' : 'grid-cols-2'} lg:w-[400px]`}>
          <TabsTrigger value="companies" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Company Management</span>
            <span className="sm:hidden">Companies</span>
          </TabsTrigger>
          
          {canAccessMemberManagement && (
            <TabsTrigger value="members" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Member Management</span>
              <span className="sm:hidden">Members</span>
            </TabsTrigger>
          )}
          
          {canAccessFinancialDashboard && (
            <TabsTrigger value="financial" className="flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Financial Dashboard</span>
              <span className="sm:hidden">Finance</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Company Management Tab */}
        <TabsContent value="companies" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <h2 className="text-2xl font-semibold">Company Management</h2>
            </div>
            <RoleGuard 
              requiredPermissions={['COMPANY_UPDATE']} 
              userRole={userRole}
            >
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </RoleGuard>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Companies</CardTitle>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {searchTerm ? 'No companies found matching your search.' : error ? error : 'No companies found. Create your first company!'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.address}</TableCell>
                        <TableCell>{company.phone}</TableCell>
                        <TableCell>{company.email || '-'}</TableCell>
                        <TableCell>
                          {company.website ? (
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {company.website}
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              company.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {company.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <RoleGuard 
                              requiredPermissions={['COMPANY_UPDATE']} 
                              userRole={userRole}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(company)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </RoleGuard>
                            <RoleGuard 
                              requiredPermissions={['COMPANY_DELETE']} 
                              userRole={userRole}
                            >
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(company)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </RoleGuard>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Member Management Tab */}
        {canAccessMemberManagement && (
          <TabsContent value="members" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <h2 className="text-2xl font-semibold">Member Management</h2>
              </div>
              
              <Tabs defaultValue="members" className="w-full">
                <TabsList>
                  <TabsTrigger value="members">Active Members</TabsTrigger>
                  <TabsTrigger value="invitations">Invitations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="members">
                  <MemberManagement
                    companyId={currentCompanyId}
                    userRole={userRole}
                    currentUserId={currentUserId}
                  />
                </TabsContent>
                
                <TabsContent value="invitations">
                  <InvitationManagementPanel
                    companyId={currentCompanyId}
                    userRole={userRole}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        )}

        {/* Financial Dashboard Tab */}
        {canAccessFinancialDashboard && (
          <TabsContent value="financial" className="space-y-6">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <h2 className="text-2xl font-semibold">Financial Dashboard</h2>
            </div>
            <FinancialDashboard userId={currentUserId} />
          </TabsContent>
        )}
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <CompanyForm onClose={handleCloseDialogs} />
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <CompanyForm company={selectedCompany || undefined} onClose={handleCloseDialogs} />
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{selectedCompany?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialogs}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}>
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {searchTerm ? 'No companies found matching your search.' : error ? error : 'No companies found. Create your first company!'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.address}</TableCell>
                    <TableCell>{company.phone}</TableCell>
                    <TableCell>{company.email || '-'}</TableCell>
                    <TableCell>
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {company.website}
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          company.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {company.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(company)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(company)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <CompanyForm onClose={handleCloseDialogs} />
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <CompanyForm company={selectedCompany || undefined} onClose={handleCloseDialogs} />
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{selectedCompany?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialogs}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}