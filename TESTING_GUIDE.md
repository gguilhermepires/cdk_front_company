# Company RBAC System Testing Guide

This guide provides instructions for testing the newly implemented Company RBAC System frontend integration.

## Overview

The system now features a comprehensive tabbed interface with role-based access controls:

- **Company Management**: CRUD operations for companies
- **Member Management**: Member and invitation management 
- **Financial Dashboard**: Financial management interface

## Role Testing

### How to Test Different Roles

1. Open `src/app/page.tsx`
2. Find line ~51: `const userRole: Role = 'OWNER'`
3. Change the role to test different behaviors:
   - `'OWNER'` - Full access to all features
   - `'ADMIN'` - Company and member management, limited permissions
   - `'MEMBER'` - Read-only company access, financial dashboard only

### Expected Behaviors by Role

#### OWNER Role
**Visible Tabs**: ✅ Company Management, ✅ Member Management, ✅ Financial Dashboard

**Company Management**:
- ✅ Can create companies (Add Company button visible)
- ✅ Can edit companies (Edit button visible)
- ✅ Can delete companies (Delete button visible)
- ✅ Can view all company information

**Member Management**:
- ✅ Can view all company members
- ✅ Can invite new members (Invite Member button visible)
- ✅ Can update member roles (Role dropdown enabled)
- ✅ Can remove members (Remove button visible)
- ✅ Can transfer ownership (Transfer Ownership button visible)
- ✅ Can manage invitations (resend, cancel)

**Financial Dashboard**:
- ✅ Full access to all financial features

#### ADMIN Role  
**Visible Tabs**: ✅ Company Management, ✅ Member Management, ✅ Financial Dashboard

**Company Management**:
- ❌ Cannot create companies (Add Company button hidden)
- ✅ Can edit companies (Edit button visible)
- ❌ Cannot delete companies (Delete button hidden)
- ✅ Can view all company information

**Member Management**:
- ✅ Can view all company members
- ✅ Can invite new members (Invite Member button visible)
- ✅ Can update member roles (Role dropdown enabled, limited to ADMIN/MEMBER)
- ✅ Can remove members (Remove button visible, cannot remove OWNER)
- ❌ Cannot transfer ownership (Transfer Ownership button hidden)
- ✅ Can manage invitations (resend, cancel)

**Financial Dashboard**:
- ✅ Full access to all financial features

#### MEMBER Role
**Visible Tabs**: ✅ Company Management, ❌ Member Management, ✅ Financial Dashboard

**Company Management**:
- ❌ Cannot create companies (Add Company button hidden)
- ❌ Cannot edit companies (Edit button hidden)
- ❌ Cannot delete companies (Delete button hidden)  
- ✅ Can view all company information (read-only)

**Member Management**:
- ❌ Tab not visible (no access to member management)

**Financial Dashboard**:
- ✅ Full access to all financial features

## UI Testing Checklist

### Responsive Design Testing
- [ ] Test on desktop (1200px+)
- [ ] Test on tablet (768px-1199px)
- [ ] Test on mobile (320px-767px)
- [ ] Verify tab labels adapt on small screens (short labels on mobile)
- [ ] Ensure proper grid layout for different tab counts

### Tab Navigation Testing
- [ ] Click between all visible tabs
- [ ] Verify tab content loads properly
- [ ] Check that inactive tabs don't show content
- [ ] Test direct navigation to tabs via URL (if implemented)

### Role-Based Access Testing
- [ ] Test all three roles (OWNER, ADMIN, MEMBER)
- [ ] Verify correct tabs are visible for each role
- [ ] Check that unauthorized buttons/actions are hidden
- [ ] Test that unauthorized API calls are blocked

### Component Integration Testing
- [ ] Verify MemberManagement component works in tab context
- [ ] Check InvitationManagementPanel functionality
- [ ] Test FinancialDashboard integration
- [ ] Verify all dialog modals work properly

## Manual Testing Steps

1. **Setup**:
   - Start the development server: `npm run dev`
   - Navigate to the company management page
   - Open browser developer tools to monitor console logs

2. **Role Testing**:
   - Change the user role in the code
   - Reload the page
   - Verify expected UI elements appear/disappear
   - Test available actions work correctly

3. **Functionality Testing**:
   - Test company CRUD operations (based on role permissions)
   - Test member management features (if accessible)
   - Test invitation management
   - Test financial dashboard operations

4. **Error Handling**:
   - Test with invalid data
   - Test with network errors
   - Verify appropriate error messages display

## Known Issues & Limitations

1. **Mock Data**: Some features use mock data for development
2. **User Role**: Currently hardcoded in component, needs integration with auth system
3. **Company Selection**: Uses first available company, needs proper company context management

## Production Checklist

Before deploying to production:

- [ ] Remove hardcoded user role assignment
- [ ] Integrate with actual authentication system  
- [ ] Implement proper user context management
- [ ] Add proper error boundaries
- [ ] Test with real API endpoints
- [ ] Verify all permissions work with backend RBAC
- [ ] Add loading states for all operations
- [ ] Test with different screen readers for accessibility
- [ ] Implement proper SEO meta tags
- [ ] Add analytics tracking for tab usage

## File Structure

```
src/
├── components/
│   ├── InvitationManagementPanel.tsx  # New: Invitation management
│   ├── MemberManagement.tsx          # Existing: Member management  
│   ├── PermissionButton.tsx          # New: Permission-based button
│   ├── RoleGuard.tsx                 # New: Role-based content guard
│   └── index.ts                      # Component exports
├── services/
│   └── companyService.ts            # Enhanced: Added invitation methods
├── utils/
│   └── roleTestingHelper.ts         # New: Role testing utilities
└── app/
    └── page.tsx                     # Updated: Tabbed interface with RBAC
```