'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Company } from '@/lib/redux/slices/companySlice'
import { useAppDispatch } from '@/lib/redux/hooks'
import { createCompany, updateCompany } from '@/lib/redux/slices/companySlice'
import { toast } from 'sonner'

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'DELETED']),
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanyFormProps {
  company?: Company
  onClose: () => void
}

export function CompanyForm({ company, onClose }: CompanyFormProps) {
  const dispatch = useAppDispatch()
  const isEditing = !!company

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || '',
      address: company?.address || '',
      phone: company?.phone || '',
      email: company?.email || '',
      website: company?.website || '',
      status: company?.status || 'ACTIVE',
    },
  })

  const onSubmit = async (data: CompanyFormData) => {
    try {
      if (isEditing) {
        await dispatch(updateCompany({ ...data, id: company.id })).unwrap()
        toast.success('Company updated successfully')
      } else {
        await dispatch(createCompany(data)).unwrap()
        toast.success('Company created successfully')
      }
      onClose()
    } catch (error) {
      toast.error(isEditing ? 'Failed to update company' : 'Failed to create company')
    }
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Company' : 'Create Company'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Company Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter company name"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="Enter address"
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="Enter email"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (optional)</Label>
          <Input
            id="website"
            {...register('website')}
            placeholder="https://example.com"
          />
          {errors.website && (
            <p className="text-sm text-destructive">{errors.website.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            {...register('status')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="ACTIVE">Active</option>
            <option value="DELETED">Deleted</option>
          </select>
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}