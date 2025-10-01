import { z } from 'zod';

// ==================== BANK ACCOUNT ====================
export const bankAccountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  institution: z.string().min(1, 'Instituição é obrigatória'),
  type: z.enum(['CHECKING', 'SAVINGS', 'INVESTMENT', 'CASH', 'OTHER']),
  initialBalance: z.coerce.number().min(0, 'Saldo inicial deve ser positivo').default(0),
  color: z.string().optional(),
  sharedWithUserIds: z.array(z.string()).optional().default([]),
});

export type BankAccountFormData = z.infer<typeof bankAccountSchema>;

// ==================== CARD ====================
export const cardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  lastDigits: z.string().length(4, 'Deve ter 4 dígitos').regex(/^\d+$/, 'Apenas números'),
  type: z.enum(['CREDIT', 'DEBIT']),
  brand: z.enum(['VISA', 'MASTERCARD', 'ELO', 'AMEX', 'HIPERCARD', 'OTHER']).optional(),
  limit: z.coerce.number().min(0, 'Limite deve ser positivo').optional(),
  dueDay: z.coerce.number().min(1).max(31, 'Dia deve estar entre 1 e 31').optional(),
  closingDay: z.coerce.number().min(1).max(31, 'Dia deve estar entre 1 e 31').optional(),
  color: z.string().optional(),
  bankAccountId: z.string().optional(),
});

export type CardFormData = z.infer<typeof cardSchema>;

// ==================== CATEGORY ====================
export const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  icon: z.string().optional(),
  color: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE']),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// ==================== TRANSACTION ====================
export const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z.string().or(z.date()).optional(),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  bankAccountId: z.string().optional(),
  cardId: z.string().optional(),
  isPaid: z.boolean().optional().default(false),
  isRecurring: z.boolean().optional().default(false),
  recurringType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  installments: z.coerce.number().int().min(1).max(60, 'Máximo 60 parcelas').optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    // Se tem cartão, não precisa de conta bancária
    // Se não tem cartão, precisa de conta bancária
    if (!data.cardId && !data.bankAccountId) {
      return false;
    }
    return true;
  },
  {
    message: 'Selecione uma conta bancária ou cartão',
    path: ['bankAccountId'],
  }
);

export type TransactionFormData = z.infer<typeof transactionSchema>;

// ==================== GOAL ====================
export const goalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  targetAmount: z.coerce.number().positive('Valor alvo deve ser maior que zero'),
  deadline: z.string().or(z.date()).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  sharedWithUserIds: z.array(z.string()).optional().default([]),
});

export type GoalFormData = z.infer<typeof goalSchema>;

// ==================== GOAL CONTRIBUTION ====================
export const goalContributionSchema = z.object({
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
});

export type GoalContributionFormData = z.infer<typeof goalContributionSchema>;

// ==================== BUDGET ====================
export const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  month: z.coerce.number().int().min(1, 'Mês inválido').max(12, 'Mês inválido'),
  year: z.coerce.number().int().min(2000, 'Ano inválido').max(2100, 'Ano inválido'),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;

// ==================== LOGIN ====================
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ==================== REGISTER ====================
export const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// ==================== HELPERS ====================

// Função para formatar valores monetários para envio à API
export function formatCurrencyToNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  return parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
}

// Função para formatar data para ISO string
export function formatDateToISO(date: Date | string | undefined): string | undefined {
  if (!date) return undefined;
  if (typeof date === 'string') return date;
  return date.toISOString();
}

