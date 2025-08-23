import { Company } from './redux/slices/companySlice'

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Tech Solutions Ltd',
    address: '123 Tech Street, Silicon Valley, CA 94000',
    phone: '+1 (555) 123-4567',
    email: 'contact@techsolutions.com',
    website: 'https://techsolutions.com',
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Global Logistics Corp',
    address: '456 Logistics Ave, New York, NY 10001',
    phone: '+1 (555) 987-6543',
    email: 'info@globallogistics.com',
    website: 'https://globallogistics.com',
    status: 'ACTIVE',
  },
  {
    id: '3',
    name: 'Creative Design Studio',
    address: '789 Design Blvd, Los Angeles, CA 90210',
    phone: '+1 (555) 456-7890',
    email: 'hello@creativedesign.com',
    website: 'https://creativedesign.com',
    status: 'ACTIVE',
  },
  {
    id: '4',
    name: 'Financial Services Inc',
    address: '321 Finance Way, Boston, MA 02101',
    phone: '+1 (555) 321-9876',
    email: 'support@financialservices.com',
    website: 'https://financialservices.com',
    status: 'ACTIVE',
  },
  {
    id: '5',
    name: 'Old Company Name',
    address: '999 Obsolete Road, Nowhere, TX 00000',
    phone: '+1 (555) 000-0000',
    email: 'old@company.com',
    website: 'https://oldcompany.com',
    status: 'DELETED',
  },
]

export const generateMockId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

let mockStorage = [...mockCompanies]

export const mockAPI = {
  getCompanies: (): Promise<Company[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockStorage])
      }, 500)
    })
  },

  createCompany: (company: Omit<Company, 'id'>): Promise<Company> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCompany = { ...company, id: generateMockId() }
        mockStorage.push(newCompany)
        resolve(newCompany)
      }, 500)
    })
  },

  updateCompany: (company: Company): Promise<Company> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockStorage.findIndex(c => c.id === company.id)
        if (index === -1) {
          reject(new Error('Company not found'))
          return
        }
        mockStorage[index] = company
        resolve(company)
      }, 500)
    })
  },

  deleteCompany: (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockStorage.findIndex(c => c.id === id)
        if (index === -1) {
          reject(new Error('Company not found'))
          return
        }
        mockStorage.splice(index, 1)
        resolve()
      }, 500)
    })
  },

  resetMockData: () => {
    mockStorage = [...mockCompanies]
  }
}