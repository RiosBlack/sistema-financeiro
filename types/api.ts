// Tipos para a API

export type AccountType = "CHECKING" | "SAVINGS" | "INVESTMENT" | "CASH" | "OTHER";
export type AccountRole = "OWNER" | "MEMBER";
export type CardType = "CREDIT" | "DEBIT";
export type CardBrand = "VISA" | "MASTERCARD" | "ELO" | "AMEX" | "HIPERCARD" | "OTHER";
export type TransactionType = "INCOME" | "EXPENSE";
export type RecurringType = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface BankAccount {
  id: string;
  name: string;
  institution: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  color?: string | null;
  isActive: boolean;
  isShared: boolean;
  createdById: string;
  users?: UserBankAccount[];
  cards?: Card[];
  transactions?: Transaction[];
  _count?: {
    transactions: number;
    cards: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserBankAccount {
  id: string;
  userId: string;
  bankAccountId: string;
  role: AccountRole;
  user: User;
  createdAt: string;
}

export interface Card {
  id: string;
  name: string;
  lastDigits: string;
  type: CardType;
  brand?: CardBrand | null;
  limit?: number | null;
  dueDay?: number | null;
  closingDay?: number | null;
  color?: string | null;
  isActive: boolean;
  isShared: boolean;
  userId: string;
  bankAccountId?: string | null;
  bankAccount?: {
    id: string;
    name: string;
    institution: string;
  } | null;
  transactions?: Transaction[];
  _count?: {
    transactions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  type: TransactionType;
  isDefault: boolean;
  isShared: boolean;
  createdById?: string | null;
  _count?: {
    transactions: number;
    budgets: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  isPaid: boolean;
  isRecurring: boolean;
  recurringType?: RecurringType | null;
  installments?: number | null;
  currentInstallment?: number | null;
  isShared?: boolean;
  userId: string;
  categoryId: string;
  category?: Category;
  bankAccountId?: string | null;
  bankAccount?: {
    id: string;
    name: string;
    institution: string;
  } | null;
  cardId?: string | null;
  card?: {
    id: string;
    name: string;
    lastDigits: string;
  } | null;
  parentTransactionId?: string | null;
  parentTransaction?: Transaction | null;
  childTransactions?: Transaction[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  name: string;
  description?: string | null;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
  icon?: string | null;
  color?: string | null;
  isCompleted: boolean;
  isShared?: boolean;
  createdById: string;
  createdBy?: {
    id: string;
    name: string | null;
  };
  users?: UserGoal[];
  createdAt: string;
  updatedAt: string;
}

export interface UserGoal {
  id: string;
  userId: string;
  goalId: string;
  contribution: number;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  userId: string;
  categoryId: string;
  category?: Category;
  spent?: number;
  remaining?: number;
  percentageUsed?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Request types
export interface CreateBankAccountRequest {
  name: string;
  institution: string;
  type: AccountType;
  initialBalance?: number;
  color?: string;
  sharedWithUserIds?: string[];
}

export interface CreateCardRequest {
  name: string;
  lastDigits: string;
  type: CardType;
  brand?: CardBrand;
  limit?: number;
  dueDay?: number;
  closingDay?: number;
  color?: string;
  bankAccountId?: string;
}

export interface CreateCategoryRequest {
  name: string;
  icon?: string;
  color?: string;
  type: TransactionType;
}

export interface CreateTransactionRequest {
  description: string;
  amount: number;
  type: TransactionType;
  date?: string;
  categoryId: string;
  bankAccountId?: string;
  cardId?: string;
  isPaid?: boolean;
  isRecurring?: boolean;
  recurringType?: RecurringType;
  installments?: number;
  notes?: string;
}

export interface CreateGoalRequest {
  name: string;
  description?: string;
  targetAmount: number;
  deadline?: string;
  icon?: string;
  color?: string;
  sharedWithUserIds?: string[];
}

export interface CreateBudgetRequest {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  bankAccountId?: string;
  cardId?: string;
  isPaid?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

