'use client'

import { useState } from 'react'
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  DollarSign,
  Eye,
  EyeOff,
  Wallet,
  Receipt,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  useGetAccountBalanceQuery,
  useGetAccountTransactionsQuery,
  useGetExpensesQuery,
  useGetIncomeQuery,
  useCreditAccountMutation,
  useCreateExpenseMutation,
  useCreateIncomeMutation,
  usePayExpenseMutation,
  useAddIncomeToAccountMutation,
  CreateExpenseRequest,
  CreateIncomeRequest
} from '@/services/paymentService'

interface FinancialDashboardProps {
  userId?: string
}

export default function FinancialDashboard({ userId }: FinancialDashboardProps) {
  const [showBalance, setShowBalance] = useState(true)
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false)
  const [showCreateExpenseDialog, setShowCreateExpenseDialog] = useState(false)
  const [showCreateIncomeDialog, setShowCreateIncomeDialog] = useState(false)
  
  // Form states
  const [addFundsAmount, setAddFundsAmount] = useState('')
  const [addFundsDescription, setAddFundsDescription] = useState('')
  const [expenseForm, setExpenseForm] = useState<CreateExpenseRequest>({
    description: '',
    amount: 0,
    category: '',
    expenseDate: new Date().toISOString().split('T')[0],
  })
  const [incomeForm, setIncomeForm] = useState<CreateIncomeRequest>({
    source: '',
    amount: 0,
    frequency: 'one-time',
    receivedAt: new Date().toISOString().split('T')[0],
    category: '',
    isRecurring: false,
  })

  // API Hooks
  const { data: accountBalance, isLoading: balanceLoading, error: balanceError } = useGetAccountBalanceQuery()
  const { data: transactions, isLoading: transactionsLoading } = useGetAccountTransactionsQuery({})
  const { data: expenses, isLoading: expensesLoading } = useGetExpensesQuery()
  const { data: income, isLoading: incomeLoading } = useGetIncomeQuery()
  
  // Mutations
  const [creditAccount] = useCreditAccountMutation()
  const [createExpense] = useCreateExpenseMutation()
  const [createIncome] = useCreateIncomeMutation()
  const [payExpense] = usePayExpenseMutation()
  const [addIncomeToAccount] = useAddIncomeToAccountMutation()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: accountBalance?.currency || 'USD'
    }).format(amount)
  }

  const handleAddFunds = async () => {
    if (!addFundsAmount || parseFloat(addFundsAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      await creditAccount({
        amount: parseFloat(addFundsAmount),
        description: addFundsDescription || 'Account credit'
      }).unwrap()
      
      toast.success('Funds added successfully')
      setShowAddFundsDialog(false)
      setAddFundsAmount('')
      setAddFundsDescription('')
    } catch (error) {
      toast.error('Failed to add funds')
      console.error('Error adding funds:', error)
    }
  }

  const handleCreateExpense = async () => {
    if (!expenseForm.description || expenseForm.amount <= 0) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await createExpense(expenseForm).unwrap()
      toast.success('Expense created successfully')
      setShowCreateExpenseDialog(false)
      setExpenseForm({
        description: '',
        amount: 0,
        category: '',
        expenseDate: new Date().toISOString().split('T')[0],
      })
    } catch (error) {
      toast.error('Failed to create expense')
      console.error('Error creating expense:', error)
    }
  }

  const handleCreateIncome = async () => {
    if (!incomeForm.source || incomeForm.amount <= 0) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await createIncome(incomeForm).unwrap()
      toast.success('Income recorded successfully')
      setShowCreateIncomeDialog(false)
      setIncomeForm({
        source: '',
        amount: 0,
        frequency: 'one-time',
        receivedAt: new Date().toISOString().split('T')[0],
        category: '',
        isRecurring: false,
      })
    } catch (error) {
      toast.error('Failed to record income')
      console.error('Error creating income:', error)
    }
  }

  const handlePayExpense = async (expenseId: string) => {
    try {
      await payExpense(expenseId).unwrap()
      toast.success('Expense paid successfully')
    } catch (error) {
      toast.error('Failed to pay expense')
      console.error('Error paying expense:', error)
    }
  }

  const handleAddIncomeToAccount = async (incomeId: string) => {
    try {
      await addIncomeToAccount(incomeId).unwrap()
      toast.success('Income added to account successfully')
    } catch (error) {
      toast.error('Failed to add income to account')
      console.error('Error adding income to account:', error)
    }
  }

  if (balanceError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Failed to load financial data</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wallet className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowCreateExpenseDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
          <Button onClick={() => setShowCreateIncomeDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Income
          </Button>
        </div>
      </div>

      {/* Account Balance Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddFundsDialog(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Funds
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {balanceLoading ? (
              <div className="w-32 h-8 bg-gray-200 animate-pulse rounded" />
            ) : showBalance ? (
              formatCurrency(accountBalance?.balance || 0)
            ) : (
              '****'
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Last updated: {accountBalance?.lastUpdated ? new Date(accountBalance.lastUpdated).toLocaleString() : 'N/A'}
          </p>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expensesLoading ? (
                <div className="w-20 h-6 bg-gray-200 animate-pulse rounded" />
              ) : (
                formatCurrency(expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0)
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {incomeLoading ? (
                <div className="w-20 h-6 bg-gray-200 animate-pulse rounded" />
              ) : (
                formatCurrency(income?.reduce((sum, inc) => sum + inc.amount, 0) || 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expensesLoading ? (
                <div className="w-12 h-6 bg-gray-200 animate-pulse rounded" />
              ) : (
                expenses?.filter(exp => !exp.isPaid).length || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactionsLoading ? (
                <div className="w-12 h-6 bg-gray-200 animate-pulse rounded" />
              ) : (
                transactions?.length || 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expensesLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-full h-12 bg-gray-200 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses?.slice(0, 10).map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          expense.isPaid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {expense.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {!expense.isPaid && (
                        <Button
                          size="sm"
                          onClick={() => handlePayExpense(expense.id)}
                        >
                          Pay Now
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!expenses || expenses.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No expenses found. Create your first expense!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Income Table */}
      <Card>
        <CardHeader>
          <CardTitle>Income Records</CardTitle>
        </CardHeader>
        <CardContent>
          {incomeLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-full h-12 bg-gray-200 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {income?.slice(0, 10).map((incomeItem) => (
                  <TableRow key={incomeItem.id}>
                    <TableCell className="font-medium">{incomeItem.source}</TableCell>
                    <TableCell>{incomeItem.category || '-'}</TableCell>
                    <TableCell>{formatCurrency(incomeItem.amount)}</TableCell>
                    <TableCell className="capitalize">{incomeItem.frequency}</TableCell>
                    <TableCell>{new Date(incomeItem.receivedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddIncomeToAccount(incomeItem.id)}
                      >
                        Add to Account
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!income || income.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No income records found. Add your first income!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Funds Dialog */}
      <Dialog open={showAddFundsDialog} onOpenChange={setShowAddFundsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>
              Add funds to your account balance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={addFundsAmount}
                onChange={(e) => setAddFundsAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={addFundsDescription}
                onChange={(e) => setAddFundsDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFundsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFunds}>Add Funds</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Expense Dialog */}
      <Dialog open={showCreateExpenseDialog} onOpenChange={setShowCreateExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Expense</DialogTitle>
            <DialogDescription>
              Record a new expense
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="exp-description">Description*</Label>
              <Input
                id="exp-description"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                placeholder="Enter description"
              />
            </div>
            <div>
              <Label htmlFor="exp-amount">Amount*</Label>
              <Input
                id="exp-amount"
                type="number"
                step="0.01"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({...expenseForm, amount: parseFloat(e.target.value) || 0})}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label htmlFor="exp-category">Category*</Label>
              <Input
                id="exp-category"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                placeholder="Enter category"
              />
            </div>
            <div>
              <Label htmlFor="exp-date">Expense Date</Label>
              <Input
                id="exp-date"
                type="date"
                value={expenseForm.expenseDate}
                onChange={(e) => setExpenseForm({...expenseForm, expenseDate: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateExpenseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateExpense}>Create Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Income Dialog */}
      <Dialog open={showCreateIncomeDialog} onOpenChange={setShowCreateIncomeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Income</DialogTitle>
            <DialogDescription>
              Add a new income record
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inc-source">Source*</Label>
              <Input
                id="inc-source"
                value={incomeForm.source}
                onChange={(e) => setIncomeForm({...incomeForm, source: e.target.value})}
                placeholder="Enter income source"
              />
            </div>
            <div>
              <Label htmlFor="inc-amount">Amount*</Label>
              <Input
                id="inc-amount"
                type="number"
                step="0.01"
                value={incomeForm.amount}
                onChange={(e) => setIncomeForm({...incomeForm, amount: parseFloat(e.target.value) || 0})}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label htmlFor="inc-frequency">Frequency</Label>
              <Select
                value={incomeForm.frequency}
                onValueChange={(value: 'one-time' | 'monthly' | 'yearly' | 'weekly') => 
                  setIncomeForm({...incomeForm, frequency: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-time</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="inc-category">Category</Label>
              <Input
                id="inc-category"
                value={incomeForm.category}
                onChange={(e) => setIncomeForm({...incomeForm, category: e.target.value})}
                placeholder="Enter category (optional)"
              />
            </div>
            <div>
              <Label htmlFor="inc-date">Received Date</Label>
              <Input
                id="inc-date"
                type="date"
                value={incomeForm.receivedAt}
                onChange={(e) => setIncomeForm({...incomeForm, receivedAt: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateIncomeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateIncome}>Record Income</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}