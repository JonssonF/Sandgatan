export type ExpenseType = 'Fixed' | 'Variable'
export type CategoryType = 'Expense' | 'Income'

export interface IncomeDto {
  id: number
  name: string
  amount: number
  person: string
  categoryId?: number | null
  categoryName?: string | null
  month: number
  year: number
  isRecurring: boolean
  notes?: string | null
}

export interface UpsertIncomeDto {
  name: string
  amount: number
  person: string
  categoryId?: number | null
  month: number
  year: number
  isRecurring: boolean
  notes?: string | null
}

export interface ExpenseDto {
  id: number
  name: string
  amount: number
  interestAmount?: number | null
  amortizationAmount?: number | null
  categoryId: number
  categoryName: string
  expenseType: ExpenseType
  month: number
  year: number
  isRecurring: boolean
  dueDay?: number | null
  notes?: string | null
}

export interface UpsertExpenseDto {
  name: string
  /** Explicit total. When null, the backend uses interest + amortization. */
  amount: number | null
  interestAmount?: number | null
  amortizationAmount?: number | null
  categoryId: number
  expenseType: ExpenseType
  month: number
  year: number
  isRecurring: boolean
  dueDay?: number | null
  notes?: string | null
}

export interface SavingDto {
  id: number
  name: string
  amount: number
  person?: string | null
  month: number
  year: number
  isRecurring: boolean
  savingsType: string
  notes?: string | null
}

export interface UpsertSavingDto {
  name: string
  amount: number
  person?: string | null
  month: number
  year: number
  isRecurring: boolean
  savingsType: string
  notes?: string | null
}

export interface CategoryDto {
  id: number
  name: string
  color?: string | null
  icon?: string | null
  isLoan: boolean
  type: CategoryType
}

export interface UpsertCategoryDto {
  name: string
  color?: string | null
  icon?: string | null
  isLoan: boolean
  /** Only used on create — a category never changes type. */
  type: CategoryType
}

export interface BudgetSummaryDto {
  year: number
  month: number
  totalIncome: number
  totalFixedExpenses: number
  totalVariableExpenses: number
  totalExpenses: number
  totalSavings: number
  totalLoans: number
  totalLoanInterest: number
  totalLoanAmortization: number
  remainingAfterExpenses: number
  remainingAfterSavings: number
  savingsRatePercent: number
  expenseRatePercent: number
}

export interface CopyRecurringResultDto {
  incomesCopied: number
  expensesCopied: number
  savingsCopied: number
}
