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
import { Receivable } from '@/types';
import { toast } from 'sonner';

const ReceivablesPage = () => {
  const { receivables, settings, selectedMonth, addReceivable, updateReceivable, deleteReceivable } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);

  const monthReceivables = receivables.filter(rec => isSameMonth(rec.dueDate, selectedMonth));

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    splitBetween: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.amount || !formData.category || formData.splitBetween.length === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const receivable: Receivable = {
      id: editingReceivable?.id || Date.now().toString(),
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      dueDate: new Date(formData.dueDate),
      status: 'pending',
      splitBetween: formData.splitBetween,
    };

    if (editingReceivable) {
      updateReceivable(editingReceivable.id, receivable);
      toast.success('Recebível atualizado com sucesso');
    } else {
      addReceivable(receivable);
      toast.success('Recebível adicionado com sucesso');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      splitBetween: [],
    });
    setEditingReceivable(null);
  };

  const handleEdit = (receivable: Receivable) => {
    setEditingReceivable(receivable);
    setFormData({
      description: receivable.description,
      amount: receivable.amount.toString(),
      category: receivable.category,
      dueDate: format(receivable.dueDate, 'yyyy-MM-dd'),
      splitBetween: receivable.splitBetween,
    });
    setIsDialogOpen(true);
  };

  const handleMarkAsReceived = (id: string) => {
    updateReceivable(id, { status: 'paid', receivedDate: new Date() });
    toast.success('Recebível marcado como recebido');
  };

  const handleDelete = (id: string) => {
    deleteReceivable(id);
    toast.success('Recebível excluído');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">A Receber</h2>
          <p className="text-muted-foreground">Gerencie seus recebíveis</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Recebível
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingReceivable ? 'Editar Recebível' : 'Novo Recebível'}</DialogTitle>
              <DialogDescription>Adicione os detalhes do recebível</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Freelance"
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
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.incomeCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Data de Recebimento *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
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

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingReceivable ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {monthReceivables.map(receivable => {
          const amountPerPerson = receivable.amount / receivable.splitBetween.length;
          return (
            <Card key={receivable.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {receivable.description}
                      {receivable.status === 'paid' && (
                        <Badge className="bg-success text-success-foreground">Recebido</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{receivable.category}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-success">R$ {receivable.amount.toFixed(2)}</p>
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
                      <span className="text-muted-foreground">Recebimento:</span>{' '}
                      {format(receivable.dueDate, "dd/MM/yyyy")}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Dividido entre:</span>{' '}
                      {receivable.splitBetween.map(id => 
                        settings.people.find(p => p.id === id)?.name
                      ).join(', ')}
                    </p>
                    {receivable.receivedDate && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Recebido em:</span>{' '}
                        {format(receivable.receivedDate, "dd/MM/yyyy")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {receivable.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => handleMarkAsReceived(receivable.id)}>
                        <Check className="h-4 w-4 mr-1" />
                        Marcar como Recebido
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleEdit(receivable)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(receivable.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {monthReceivables.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum recebível cadastrado para este mês</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReceivablesPage;
