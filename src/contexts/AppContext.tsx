import { createContext, useContext, useState, ReactNode } from 'react';
import { Expense, Receivable, Settings, Category, Person } from '@/types';

interface AppContextType {
  expenses: Expense[];
  receivables: Receivable[];
  settings: Settings;
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addReceivable: (receivable: Receivable) => void;
  updateReceivable: (id: string, receivable: Partial<Receivable>) => void;
  deleteReceivable: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  addPerson: (person: Person) => void;
  removePerson: (id: string) => void;
  addCategory: (category: Category) => void;
  removeCategory: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultCategories: Category[] = [
  { id: '1', name: 'Aluguel', type: 'expense' },
  { id: '2', name: 'Energia', type: 'expense' },
  { id: '3', name: 'Água', type: 'expense' },
  { id: '4', name: 'Internet', type: 'expense' },
  { id: '5', name: 'Supermercado', type: 'expense' },
  { id: '6', name: 'Salário', type: 'income' },
];

const defaultPeople: Person[] = [
  { id: '1', name: 'Pessoa 1' },
  { id: '2', name: 'Pessoa 2' },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [settings, setSettings] = useState<Settings>({
    monthlyIncome: 0,
    people: defaultPeople,
    expenseCategories: defaultCategories.filter(c => c.type === 'expense'),
    incomeCategories: defaultCategories.filter(c => c.type === 'income'),
  });

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
  };

  const updateExpense = (id: string, updatedExpense: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(exp => (exp.id === id ? { ...exp, ...updatedExpense } : exp))
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const addReceivable = (receivable: Receivable) => {
    setReceivables(prev => [...prev, receivable]);
  };

  const updateReceivable = (id: string, updatedReceivable: Partial<Receivable>) => {
    setReceivables(prev =>
      prev.map(rec => (rec.id === id ? { ...rec, ...updatedReceivable } : rec))
    );
  };

  const deleteReceivable = (id: string) => {
    setReceivables(prev => prev.filter(rec => rec.id !== id));
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addPerson = (person: Person) => {
    setSettings(prev => ({
      ...prev,
      people: [...prev.people, person],
    }));
  };

  const removePerson = (id: string) => {
    setSettings(prev => ({
      ...prev,
      people: prev.people.filter(p => p.id !== id),
    }));
  };

  const addCategory = (category: Category) => {
    setSettings(prev => ({
      ...prev,
      expenseCategories:
        category.type === 'expense'
          ? [...prev.expenseCategories, category]
          : prev.expenseCategories,
      incomeCategories:
        category.type === 'income'
          ? [...prev.incomeCategories, category]
          : prev.incomeCategories,
    }));
  };

  const removeCategory = (id: string) => {
    setSettings(prev => ({
      ...prev,
      expenseCategories: prev.expenseCategories.filter(c => c.id !== id),
      incomeCategories: prev.incomeCategories.filter(c => c.id !== id),
    }));
  };

  return (
    <AppContext.Provider
      value={{
        expenses,
        receivables,
        settings,
        selectedMonth,
        setSelectedMonth,
        addExpense,
        updateExpense,
        deleteExpense,
        addReceivable,
        updateReceivable,
        deleteReceivable,
        updateSettings,
        addPerson,
        removePerson,
        addCategory,
        removeCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
