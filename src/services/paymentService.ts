import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// API Base URL from environment
const PAYMENT_API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || 'https://jrjakwz2be.execute-api.us-east-1.amazonaws.com/api'

// Data Types
export interface Account {
  userId: string
  balance: number
  currency: string
  lastUpdated: string
  version: number
}

export interface Transaction {
  id: string
  userId: string
  type: 'EXPENSE' | 'INCOME' | 'PAYMENT' | 'ACCOUNT_CREDIT' | 'ACCOUNT_DEBIT'
  amount: number
  description: string
  category?: string
  createdAt: string
  relatedId?: string
}

export interface Expense {
  id: string
  userId: string
  description: string
  amount: number
  category: string
  expenseDate: string
  isPaid: boolean
  relatedBillId?: string
  dueDate?: string
}

export interface Income {
  id: string
  userId: string
  source: string
  amount: number
  frequency: 'one-time' | 'monthly' | 'yearly' | 'weekly'
  receivedAt: string
  category?: string
  isRecurring: boolean
  nextDueDate?: string
}

export interface CreateExpenseRequest {
  description: string
  amount: number
  category: string
  expenseDate?: string
  dueDate?: string
}

export interface CreateIncomeRequest {
  source: string
  amount: number
  frequency: 'one-time' | 'monthly' | 'yearly' | 'weekly'
  receivedAt?: string
  category?: string
  isRecurring: boolean
  nextDueDate?: string
}

export interface CreditAccountRequest {
  amount: number
  description: string
}

// Payment Service API using RTK Query
export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${PAYMENT_API_URL}/payment/v1`,
    prepareHeaders: (headers, { getState }) => {
      // Get auth token from Redux state if available
      const state = getState() as any
      const token = state.auth?.loginResponse?.tokens?.accessToken
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Account', 'Transaction', 'Expense', 'Income'],
  endpoints: (builder) => ({
    // Account Management
    getAccountBalance: builder.query<Account, void>({
      query: () => '/payments/account/balance',
      providesTags: ['Account'],
    }),
    
    getAccountTransactions: builder.query<Transaction[], { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => 
        `/payments/account/transactions?page=${page}&limit=${limit}`,
      providesTags: ['Transaction'],
    }),
    
    creditAccount: builder.mutation<Account, CreditAccountRequest>({
      query: (data) => ({
        url: '/payments/account/credit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Account', 'Transaction'],
    }),

    // Expense Management
    getExpenses: builder.query<Expense[], void>({
      query: () => '/payments/expenses',
      providesTags: ['Expense'],
    }),
    
    createExpense: builder.mutation<Expense, CreateExpenseRequest>({
      query: (data) => ({
        url: '/payments/expenses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Expense'],
    }),
    
    updateExpense: builder.mutation<Expense, { id: string; data: Partial<Expense> }>({
      query: ({ id, data }) => ({
        url: `/payments/expenses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Expense'],
    }),
    
    payExpense: builder.mutation<void, string>({
      query: (id) => ({
        url: `/payments/expenses/${id}/pay`,
        method: 'POST',
      }),
      invalidatesTags: ['Expense', 'Account', 'Transaction'],
    }),

    // Income Management
    getIncome: builder.query<Income[], void>({
      query: () => '/payments/income',
      providesTags: ['Income'],
    }),
    
    createIncome: builder.mutation<Income, CreateIncomeRequest>({
      query: (data) => ({
        url: '/payments/income',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Income'],
    }),
    
    updateIncome: builder.mutation<Income, { id: string; data: Partial<Income> }>({
      query: ({ id, data }) => ({
        url: `/payments/income/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Income'],
    }),
    
    addIncomeToAccount: builder.mutation<void, string>({
      query: (id) => ({
        url: `/payments/income/${id}/add-to-account`,
        method: 'POST',
      }),
      invalidatesTags: ['Income', 'Account', 'Transaction'],
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetAccountBalanceQuery,
  useGetAccountTransactionsQuery,
  useCreditAccountMutation,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  usePayExpenseMutation,
  useGetIncomeQuery,
  useCreateIncomeMutation,
  useUpdateIncomeMutation,
  useAddIncomeToAccountMutation,
} = paymentApi

// Traditional service class for non-React contexts
export class PaymentService {
  private static getHeaders(token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  // Account Management
  static async getAccountBalance(token?: string): Promise<Account> {
    const response = await fetch(`${PAYMENT_API_URL}/payment/v1/payments/account/balance`, {
      headers: this.getHeaders(token),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch account balance: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  static async getAccountTransactions(token?: string, page = 1, limit = 20): Promise<Transaction[]> {
    const response = await fetch(
      `${PAYMENT_API_URL}/payment/v1/payments/account/transactions?page=${page}&limit=${limit}`,
      {
        headers: this.getHeaders(token),
      }
    )
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`)
    }
    
    const data = await response.json()
    return Array.isArray(data) ? data : data.transactions || []
  }
  
  static async creditAccount(amount: number, description: string, token?: string): Promise<Account> {
    const response = await fetch(`${PAYMENT_API_URL}/payment/v1/payments/account/credit`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ amount, description }),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to credit account: ${response.statusText}`)
    }
    
    return response.json()
  }

  // Expense Management
  static async getExpenses(token?: string): Promise<Expense[]> {
    const response = await fetch(`${PAYMENT_API_URL}/payment/v1/payments/expenses`, {
      headers: this.getHeaders(token),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch expenses: ${response.statusText}`)
    }
    
    const data = await response.json()
    return Array.isArray(data) ? data : data.expenses || []
  }
  
  static async createExpense(expense: CreateExpenseRequest, token?: string): Promise<Expense> {
    const response = await fetch(`${PAYMENT_API_URL}/payment/v1/payments/expenses`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(expense),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to create expense: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  static async payExpense(expenseId: string, token?: string): Promise<void> {
    const response = await fetch(`${PAYMENT_API_URL}/payment/v1/payments/expenses/${expenseId}/pay`, {
      method: 'POST',
      headers: this.getHeaders(token),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to pay expense: ${response.statusText}`)
    }
  }

  // Income Management
  static async getIncome(token?: string): Promise<Income[]> {
    const response = await fetch(`${PAYMENT_API_URL}/payment/v1/payments/income`, {
      headers: this.getHeaders(token),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch income: ${response.statusText}`)
    }
    
    const data = await response.json()
    return Array.isArray(data) ? data : data.income || []
  }
  
  static async createIncome(income: CreateIncomeRequest, token?: string): Promise<Income> {
    const response = await fetch(`${PAYMENT_API_URL}/payment/v1/payments/income`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(income),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to create income: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  static async addIncomeToAccount(incomeId: string, token?: string): Promise<void> {
    const response = await fetch(`${PAYMENT_API_URL}/payment/v1/payments/income/${incomeId}/add-to-account`, {
      method: 'POST',
      headers: this.getHeaders(token),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to add income to account: ${response.statusText}`)
    }
  }
}