import { Expense, Receivable, Category, Person, Settings } from '@/types';

const DB_NAME = 'FinanceApp';
const DB_VERSION = 1;

interface LocalUser {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
}

interface AppData {
  userId: string;
  expenses: Expense[];
  receivables: Receivable[];
  settings: Settings;
  people: Person[];
  categories: Category[];
}

class LocalDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for users
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }

        // Store for app data (expenses, receivables, settings per user)
        if (!db.objectStoreNames.contains('appData')) {
          const appDataStore = db.createObjectStore('appData', { keyPath: 'userId' });
          appDataStore.createIndex('userId', 'userId', { unique: true });
        }
      };
    });
  }

  // User methods
  async createUser(email: string, password: string): Promise<LocalUser> {
    if (!this.db) await this.init();

    const userId = crypto.randomUUID();
    const user: LocalUser = {
      id: userId,
      email,
      password, // In a real app, this should be hashed
      createdAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.add(user);

      request.onsuccess = () => {
        // Initialize default app data for new user
        this.initializeAppData(userId).then(() => resolve(user));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByEmail(email: string): Promise<LocalUser | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.getAll();

      request.onsuccess = () => {
        const users = request.result as LocalUser[];
        const user = users.find(u => u.email === email);
        resolve(user || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async initializeAppData(userId: string): Promise<void> {
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

    const initialData: AppData = {
      userId,
      expenses: [],
      receivables: [],
      settings: {
        monthlyIncome: 0,
        people: defaultPeople,
        expenseCategories: defaultCategories.filter(c => c.type === 'expense'),
        incomeCategories: defaultCategories.filter(c => c.type === 'income'),
      },
      people: defaultPeople,
      categories: defaultCategories,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['appData'], 'readwrite');
      const store = transaction.objectStore('appData');
      const request = store.add(initialData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // App data methods
  async getAppData(userId: string): Promise<AppData | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['appData'], 'readonly');
      const store = transaction.objectStore('appData');
      const request = store.get(userId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateAppData(userId: string, data: Partial<AppData>): Promise<void> {
    if (!this.db) await this.init();

    const currentData = await this.getAppData(userId);
    if (!currentData) throw new Error('User data not found');

    const updatedData: AppData = { ...currentData, ...data, userId };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['appData'], 'readwrite');
      const store = transaction.objectStore('appData');
      const request = store.put(updatedData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Expense methods
  async addExpense(userId: string, expense: Expense): Promise<void> {
    const appData = await this.getAppData(userId);
    if (!appData) throw new Error('User data not found');

    appData.expenses.push(expense);
    await this.updateAppData(userId, { expenses: appData.expenses });
  }

  async updateExpense(userId: string, expenseId: string, updates: Partial<Expense>): Promise<void> {
    const appData = await this.getAppData(userId);
    if (!appData) throw new Error('User data not found');

    const index = appData.expenses.findIndex(e => e.id === expenseId);
    if (index === -1) throw new Error('Expense not found');

    appData.expenses[index] = { ...appData.expenses[index], ...updates };
    await this.updateAppData(userId, { expenses: appData.expenses });
  }

  async deleteExpense(userId: string, expenseId: string): Promise<void> {
    const appData = await this.getAppData(userId);
    if (!appData) throw new Error('User data not found');

    appData.expenses = appData.expenses.filter(e => e.id !== expenseId);
    await this.updateAppData(userId, { expenses: appData.expenses });
  }

  // Receivable methods
  async addReceivable(userId: string, receivable: Receivable): Promise<void> {
    const appData = await this.getAppData(userId);
    if (!appData) throw new Error('User data not found');

    appData.receivables.push(receivable);
    await this.updateAppData(userId, { receivables: appData.receivables });
  }

  async updateReceivable(userId: string, receivableId: string, updates: Partial<Receivable>): Promise<void> {
    const appData = await this.getAppData(userId);
    if (!appData) throw new Error('User data not found');

    const index = appData.receivables.findIndex(r => r.id === receivableId);
    if (index === -1) throw new Error('Receivable not found');

    appData.receivables[index] = { ...appData.receivables[index], ...updates };
    await this.updateAppData(userId, { receivables: appData.receivables });
  }

  async deleteReceivable(userId: string, receivableId: string): Promise<void> {
    const appData = await this.getAppData(userId);
    if (!appData) throw new Error('User data not found');

    appData.receivables = appData.receivables.filter(r => r.id !== receivableId);
    await this.updateAppData(userId, { receivables: appData.receivables });
  }

  // Settings methods
  async updateSettings(userId: string, settings: Partial<Settings>): Promise<void> {
    const appData = await this.getAppData(userId);
    if (!appData) throw new Error('User data not found');

    appData.settings = { ...appData.settings, ...settings };
    await this.updateAppData(userId, { settings: appData.settings });
  }

  // People methods
  async addPerson(userId: string, person: Person): Promise<void> {
    const appData = await this.getAppData(userId);
    if (!appData) throw new Error('User data not found');

    appData.people.push(person);
    appData.settings.people.push(person);
    await this.updateAppData(userId, { people: appData.people, settings: appData.settings });
  }

  async removePerson(userId: string, personId: string): Promise<void> {
    const appData = await this.getAppData(userId);
    if (!appData) throw new Error('User data not found');

    appData.people = appData.people.filter(p => p.id !== personId);
    appData.settings.people = appData.settings.people.filter(p => p.id !== personId);
    await this.updateAppData(userId, { people: appData.people, settings: appData.settings });
  }

  // Category methods
  async addCategory(userId: string, category: Category): Promise<void> {
    const appData = await this.getAppData(userId);
    if (!appData) throw new Error('User data not found');

    appData.categories.push(category);
    if (category.type === 'expense') {
      appData.settings.expenseCategories.push(category);
    } else {
      appData.settings.incomeCategories.push(category);
    }
    await this.updateAppData(userId, { categories: appData.categories, settings: appData.settings });
  }

  async removeCategory(userId: string, categoryId: string): Promise<void> {
    const appData = await this.getAppData(userId);
    if (!appData) throw new Error('User data not found');

    appData.categories = appData.categories.filter(c => c.id !== categoryId);
    appData.settings.expenseCategories = appData.settings.expenseCategories.filter(c => c.id !== categoryId);
    appData.settings.incomeCategories = appData.settings.incomeCategories.filter(c => c.id !== categoryId);
    await this.updateAppData(userId, { categories: appData.categories, settings: appData.settings });
  }
}

export const localDb = new LocalDatabase();
