import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, Receivable, Settings, Category, Person } from '@/types';
import { localDb } from '@/lib/localDb';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [settings, setSettings] = useState<Settings>({
    monthlyIncome: 0,
    people: defaultPeople,
    expenseCategories: defaultCategories.filter(c => c.type === 'expense'),
    incomeCategories: defaultCategories.filter(c => c.type === 'income'),
  });

  // Load data from Supabase when user is logged in
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const appData = await localDb.getAppData(user.id);
      if (!appData) return;

      setExpenses(appData.expenses);
      setReceivables(appData.receivables);
      setSettings(appData.settings);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addExpense = async (expense: Expense) => {
    if (!user) return;
    
    try {
      await localDb.addExpense(user.id, expense);
      setExpenses(prev => [...prev, expense]);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const updateExpense = async (id: string, updatedExpense: Partial<Expense>) => {
    if (!user) return;
    
    try {
      await localDb.updateExpense(user.id, id, updatedExpense);
      setExpenses(prev =>
        prev.map(exp => (exp.id === id ? { ...exp, ...updatedExpense } : exp))
      );
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return;
    
    try {
      await localDb.deleteExpense(user.id, id);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const addReceivable = async (receivable: Receivable) => {
    if (!user) return;
    
    try {
      await localDb.addReceivable(user.id, receivable);
      setReceivables(prev => [...prev, receivable]);
    } catch (error) {
      console.error('Error adding receivable:', error);
    }
  };

  const updateReceivable = async (id: string, updatedReceivable: Partial<Receivable>) => {
    if (!user) return;
    
    try {
      await localDb.updateReceivable(user.id, id, updatedReceivable);
      setReceivables(prev =>
        prev.map(rec => (rec.id === id ? { ...rec, ...updatedReceivable } : rec))
      );
    } catch (error) {
      console.error('Error updating receivable:', error);
    }
  };

  const deleteReceivable = async (id: string) => {
    if (!user) return;
    
    try {
      await localDb.deleteReceivable(user.id, id);
      setReceivables(prev => prev.filter(rec => rec.id !== id));
    } catch (error) {
      console.error('Error deleting receivable:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!user) return;
    
    try {
      await localDb.updateSettings(user.id, newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const addPerson = async (person: Person) => {
    if (!user) return;
    
    try {
      await localDb.addPerson(user.id, person);
      setSettings(prev => ({
        ...prev,
        people: [...prev.people, person],
      }));
    } catch (error) {
      console.error('Error adding person:', error);
    }
  };

  const removePerson = async (id: string) => {
    if (!user) return;
    
    try {
      await localDb.removePerson(user.id, id);
      setSettings(prev => ({
        ...prev,
        people: prev.people.filter(p => p.id !== id),
      }));
    } catch (error) {
      console.error('Error removing person:', error);
    }
  };

  const addCategory = async (category: Category) => {
    if (!user) return;
    
    try {
      await localDb.addCategory(user.id, category);
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
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const removeCategory = async (id: string) => {
    if (!user) return;
    
    try {
      await localDb.removeCategory(user.id, id);
      setSettings(prev => ({
        ...prev,
        expenseCategories: prev.expenseCategories.filter(c => c.id !== id),
        incomeCategories: prev.incomeCategories.filter(c => c.id !== id),
      }));
    } catch (error) {
      console.error('Error removing category:', error);
    }
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
