export type ExpenseType = 'fixed' | 'variable' | 'installment';
export type ItemStatus = 'pending' | 'paid';

export interface Person {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  type: ExpenseType;
  category: string;
  isEssential: boolean;
  dueDate: Date;
  status: ItemStatus;
  paidDate?: Date;
  paidBy?: string;
  splitBetween: string[];
  installments?: {
    current: number;
    total: number;
  };
}

export interface Receivable {
  id: string;
  description: string;
  amount: number;
  category: string;
  dueDate: Date;
  status: ItemStatus;
  receivedDate?: Date;
  receivedBy?: string;
  splitBetween: string[];
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
}

export interface Settings {
  monthlyIncome: number;
  people: Person[];
  expenseCategories: Category[];
  incomeCategories: Category[];
}
