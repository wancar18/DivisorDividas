import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, Receivable, Settings, Category, Person } from '@/types';
import { supabase } from '@/integrations/supabase/client';
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
      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Load categories
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      // Load people
      const { data: people } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', user.id);

      // Load expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id);

      // Load receivables
      const { data: receivablesData } = await supabase
        .from('receivables')
        .select('*')
        .eq('user_id', user.id);

      if (profile) {
        setSettings(prev => ({
          ...prev,
          monthlyIncome: Number(profile.monthly_income),
          people: people?.map(p => ({ id: p.id, name: p.name })) || prev.people,
          expenseCategories: categories?.filter(c => c.type === 'expense').map(c => ({ id: c.id, name: c.name, type: c.type as 'expense' })) || prev.expenseCategories,
          incomeCategories: categories?.filter(c => c.type === 'income').map(c => ({ id: c.id, name: c.name, type: c.type as 'income' })) || prev.incomeCategories,
        }));
      }

      if (expensesData) {
        setExpenses(expensesData.map(e => ({
          id: e.id,
          description: e.description,
          amount: Number(e.amount),
          type: e.type as 'fixed' | 'variable' | 'installment',
          category: e.category,
          isEssential: e.is_essential,
          dueDate: new Date(e.due_date),
          status: e.status as 'pending' | 'paid',
          paidDate: e.paid_date ? new Date(e.paid_date) : undefined,
          paidBy: e.paid_by || undefined,
          splitBetween: e.split_between || [],
          installments: e.installment_current && e.installment_total ? {
            current: e.installment_current,
            total: e.installment_total,
          } : undefined,
        })));
      }

      if (receivablesData) {
        setReceivables(receivablesData.map(r => ({
          id: r.id,
          description: r.description,
          amount: Number(r.amount),
          category: r.category,
          dueDate: new Date(r.due_date),
          status: r.status as 'pending' | 'paid',
          receivedDate: r.received_date ? new Date(r.received_date) : undefined,
          receivedBy: r.received_by || undefined,
          splitBetween: r.split_between || [],
        })));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addExpense = async (expense: Expense) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        description: expense.description,
        amount: expense.amount,
        type: expense.type,
        category: expense.category,
        is_essential: expense.isEssential,
        due_date: expense.dueDate.toISOString(),
        status: expense.status,
        paid_date: expense.paidDate?.toISOString(),
        paid_by: expense.paidBy,
        split_between: expense.splitBetween,
        installment_current: expense.installments?.current,
        installment_total: expense.installments?.total,
      })
      .select()
      .single();

    if (!error && data) {
      setExpenses(prev => [...prev, {
        ...expense,
        id: data.id,
      }]);
    }
  };

  const updateExpense = async (id: string, updatedExpense: Partial<Expense>) => {
    if (!user) return;
    
    const updateData: any = {};
    if (updatedExpense.description) updateData.description = updatedExpense.description;
    if (updatedExpense.amount !== undefined) updateData.amount = updatedExpense.amount;
    if (updatedExpense.type) updateData.type = updatedExpense.type;
    if (updatedExpense.category) updateData.category = updatedExpense.category;
    if (updatedExpense.isEssential !== undefined) updateData.is_essential = updatedExpense.isEssential;
    if (updatedExpense.dueDate) updateData.due_date = updatedExpense.dueDate.toISOString();
    if (updatedExpense.status) updateData.status = updatedExpense.status;
    if (updatedExpense.paidDate) updateData.paid_date = updatedExpense.paidDate.toISOString();
    if (updatedExpense.paidBy) updateData.paid_by = updatedExpense.paidBy;
    if (updatedExpense.splitBetween) updateData.split_between = updatedExpense.splitBetween;
    if (updatedExpense.installments) {
      updateData.installment_current = updatedExpense.installments.current;
      updateData.installment_total = updatedExpense.installments.total;
    }

    const { error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setExpenses(prev =>
        prev.map(exp => (exp.id === id ? { ...exp, ...updatedExpense } : exp))
      );
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    }
  };

  const addReceivable = async (receivable: Receivable) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('receivables')
      .insert({
        user_id: user.id,
        description: receivable.description,
        amount: receivable.amount,
        category: receivable.category,
        due_date: receivable.dueDate.toISOString(),
        status: receivable.status,
        received_date: receivable.receivedDate?.toISOString(),
        received_by: receivable.receivedBy,
        split_between: receivable.splitBetween,
      })
      .select()
      .single();

    if (!error && data) {
      setReceivables(prev => [...prev, {
        ...receivable,
        id: data.id,
      }]);
    }
  };

  const updateReceivable = async (id: string, updatedReceivable: Partial<Receivable>) => {
    if (!user) return;
    
    const updateData: any = {};
    if (updatedReceivable.description) updateData.description = updatedReceivable.description;
    if (updatedReceivable.amount !== undefined) updateData.amount = updatedReceivable.amount;
    if (updatedReceivable.category) updateData.category = updatedReceivable.category;
    if (updatedReceivable.dueDate) updateData.due_date = updatedReceivable.dueDate.toISOString();
    if (updatedReceivable.status) updateData.status = updatedReceivable.status;
    if (updatedReceivable.receivedDate) updateData.received_date = updatedReceivable.receivedDate.toISOString();
    if (updatedReceivable.receivedBy) updateData.received_by = updatedReceivable.receivedBy;
    if (updatedReceivable.splitBetween) updateData.split_between = updatedReceivable.splitBetween;

    const { error } = await supabase
      .from('receivables')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setReceivables(prev =>
        prev.map(rec => (rec.id === id ? { ...rec, ...updatedReceivable } : rec))
      );
    }
  };

  const deleteReceivable = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('receivables')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setReceivables(prev => prev.filter(rec => rec.id !== id));
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!user) return;
    
    if (newSettings.monthlyIncome !== undefined) {
      await supabase
        .from('profiles')
        .update({ monthly_income: newSettings.monthlyIncome })
        .eq('id', user.id);
    }

    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addPerson = async (person: Person) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('people')
      .insert({
        user_id: user.id,
        name: person.name,
      })
      .select()
      .single();

    if (!error && data) {
      setSettings(prev => ({
        ...prev,
        people: [...prev.people, { id: data.id, name: data.name }],
      }));
    }
  };

  const removePerson = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setSettings(prev => ({
        ...prev,
        people: prev.people.filter(p => p.id !== id),
      }));
    }
  };

  const addCategory = async (category: Category) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: category.name,
        type: category.type,
      })
      .select()
      .single();

    if (!error && data) {
      const newCategory = { id: data.id, name: data.name, type: data.type as 'expense' | 'income' };
      setSettings(prev => ({
        ...prev,
        expenseCategories:
          category.type === 'expense'
            ? [...prev.expenseCategories, newCategory]
            : prev.expenseCategories,
        incomeCategories:
          category.type === 'income'
            ? [...prev.incomeCategories, newCategory]
            : prev.incomeCategories,
      }));
    }
  };

  const removeCategory = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setSettings(prev => ({
        ...prev,
        expenseCategories: prev.expenseCategories.filter(c => c.id !== id),
        incomeCategories: prev.incomeCategories.filter(c => c.id !== id),
      }));
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
