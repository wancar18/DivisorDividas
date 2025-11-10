import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Check, Trash2, Edit } from 'lucide-react';
import { format, isSameMonth } from 'date-fns';
import { Expense, ExpenseType } from '@/types';
import { toast } from 'sonner';

const ExpensesPage = () => {
  const { expenses, settings, selectedMonth, addExpense, updateExpense, deleteExpense } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const monthExpenses = expenses.filter(exp => isSameMonth(exp.dueDate, selectedMonth));

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'fixed' as ExpenseType,
    category: '',
    isEssential: false,
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    splitBetween: [] as string[],
    installmentCurrent: '1',
    installmentTotal: '1',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.amount || !formData.category || formData.splitBetween.length === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const expense: Expense = {
      id: editingExpense?.id || Date.now().toString(),
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      isEssential: formData.isEssential,
      dueDate: new Date(formData.dueDate),
      status: 'pending',
      splitBetween: formData.splitBetween,
      installments: formData.type === 'installment' ? {
        current: parseInt(formData.installmentCurrent),
        total: parseInt(formData.installmentTotal),
      } : undefined,
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, expense);
      toast.success('Despesa atualizada com sucesso');
    } else {
      addExpense(expense);
      toast.success('Despesa adicionada com sucesso');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      type: 'fixed',
      category: '',
      isEssential: false,
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      splitBetween: [],
      installmentCurrent: '1',
      installmentTotal: '1',
    });
    setEditingExpense(null);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      type: expense.type,
      category: expense.category,
      isEssential: expense.isEssential,
      dueDate: format(expense.dueDate, 'yyyy-MM-dd'),
      splitBetween: expense.splitBetween,
      installmentCurrent: expense.installments?.current.toString() || '1',
      installmentTotal: expense.installments?.total.toString() || '1',
    });
    setIsDialogOpen(true);
  };

  const handleMarkAsPaid = (id: string) => {
    updateExpense(id, { status: 'paid', paidDate: new Date() });
    toast.success('Despesa marcada como paga');
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    toast.success('Despesa excluída');
  };

  const getTypeLabel = (type: ExpenseType) => {
    const labels = { fixed: 'Fixa', variable: 'Variável', installment: 'Parcelada' };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">A Pagar</h2>
          <p className="text-muted-foreground">Gerencie suas despesas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
              <DialogDescription>Adicione os detalhes da despesa</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Aluguel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as ExpenseType })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixa</SelectItem>
                      <SelectItem value="variable">Variável</SelectItem>
                      <SelectItem value="installment">Parcelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.expenseCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.type === 'installment' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="installmentCurrent">Parcela Atual</Label>
                    <Input
                      id="installmentCurrent"
                      type="number"
                      value={formData.installmentCurrent}
                      onChange={(e) => setFormData({ ...formData, installmentCurrent: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="installmentTotal">Total de Parcelas</Label>
                    <Input
                      id="installmentTotal"
                      type="number"
                      value={formData.installmentTotal}
                      onChange={(e) => setFormData({ ...formData, installmentTotal: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="dueDate">Data de Vencimento *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Dividir entre *</Label>
                <div className="space-y-2">
                  {settings.people.map(person => (
                    <div key={person.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={person.id}
                        checked={formData.splitBetween.includes(person.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, splitBetween: [...formData.splitBetween, person.id] });
                          } else {
                            setFormData({ ...formData, splitBetween: formData.splitBetween.filter(id => id !== person.id) });
                          }
                        }}
                      />
                      <label htmlFor={person.id} className="text-sm">{person.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isEssential"
                  checked={formData.isEssential}
                  onCheckedChange={(checked) => setFormData({ ...formData, isEssential: checked as boolean })}
                />
                <label htmlFor="isEssential" className="text-sm">Despesa essencial</label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingExpense ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {monthExpenses.map(expense => {
          const amountPerPerson = expense.amount / expense.splitBetween.length;
          return (
            <Card key={expense.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {expense.description}
                      {expense.isEssential && (
                        <Badge variant="outline">Essencial</Badge>
                      )}
                      {expense.status === 'paid' && (
                        <Badge className="bg-success text-success-foreground">Pago</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {expense.category} • {getTypeLabel(expense.type)}
                      {expense.installments && ` • ${expense.installments.current}/${expense.installments.total}`}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-destructive">R$ {expense.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      R$ {amountPerPerson.toFixed(2)} por pessoa
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Vencimento:</span>{' '}
                      {format(expense.dueDate, "dd/MM/yyyy")}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Dividido entre:</span>{' '}
                      {expense.splitBetween.map(id => 
                        settings.people.find(p => p.id === id)?.name
                      ).join(', ')}
                    </p>
                    {expense.paidDate && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Pago em:</span>{' '}
                        {format(expense.paidDate, "dd/MM/yyyy")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {expense.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(expense.id)}>
                        <Check className="h-4 w-4 mr-1" />
                        Marcar como Pago
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleEdit(expense)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(expense.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {monthExpenses.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhuma despesa cadastrada para este mês</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExpensesPage;
