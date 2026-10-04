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
  loanBalance?: number | null
  interestRatePercent?: number | null
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
  /** Remaining debt. With interestRatePercent, the backend calculates the interest. */
  loanBalance?: number | null
  /** Annual interest rate in percent. */
  interestRatePercent?: number | null
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
  /** Sum of everyday purchases logged this month. */
  totalPurchases: number
  /** Everyday-purchase budget (possibly inherited); null if never set. */
  spendingBudget: number | null
  /** What purchases add to totalExpenses: the budget, or the actual sum once exceeded. */
  plannedPurchases: number
  totalExpenses: number
  totalSavings: number
  totalLoans: number
  totalLoanBalance: number
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

/** Which entries to copy to next month. A missing list means all entries of that kind. */
export interface CopyToNextMonthRequestDto {
  incomeIds?: number[]
  expenseIds?: number[]
  savingIds?: number[]
}

/** An everyday purchase ("vardagsköp"). Year/month are derived from the date by the backend. */
export interface PurchaseDto {
  id: number
  name: string
  amount: number
  /** ISO date, yyyy-MM-dd. */
  date: string
  year: number
  month: number
  categoryId: number
  categoryName: string
  categoryColor?: string | null
  notes?: string | null
}

export interface UpsertPurchaseDto {
  name: string
  amount: number
  date: string
  categoryId: number
  notes?: string | null
}

export interface SpendingBudgetDto {
  year: number
  month: number
  amount: number | null
  /** True when the amount comes from an earlier month. */
  isInherited: boolean
}
