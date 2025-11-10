import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Category } from '@/types';

const SettingsPage = () => {
  const { settings, updateSettings, addPerson, removePerson, addCategory, removeCategory } = useApp();
  const [monthlyIncome, setMonthlyIncome] = useState(settings.monthlyIncome.toString());
  const [newPersonName, setNewPersonName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'expense' | 'income'>('expense');
  const [isPersonDialogOpen, setIsPersonDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  const handleIncomeUpdate = () => {
    const value = parseFloat(monthlyIncome);
    if (isNaN(value) || value < 0) {
      toast.error('Digite um valor válido');
      return;
    }
    updateSettings({ monthlyIncome: value });
    toast.success('Renda mensal atualizada');
  };

  const handleAddPerson = () => {
    if (!newPersonName.trim()) {
      toast.error('Digite um nome válido');
      return;
    }
    addPerson({ id: Date.now().toString(), name: newPersonName });
    setNewPersonName('');
    setIsPersonDialogOpen(false);
    toast.success('Pessoa adicionada');
  };

  const handleRemovePerson = (id: string) => {
    if (settings.people.length <= 1) {
      toast.error('Deve haver pelo menos uma pessoa');
      return;
    }
    removePerson(id);
    toast.success('Pessoa removida');
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Digite um nome válido');
      return;
    }
    const category: Category = {
      id: Date.now().toString(),
      name: newCategoryName,
      type: newCategoryType,
    };
    addCategory(category);
    setNewCategoryName('');
    setIsCategoryDialogOpen(false);
    toast.success('Categoria adicionada');
  };

  const handleRemoveCategory = (id: string) => {
    removeCategory(id);
    toast.success('Categoria removida');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Configurações</h2>
        <p className="text-muted-foreground">Gerencie suas preferências</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Renda Mensal</CardTitle>
          <CardDescription>Configure sua renda mensal para cálculo do saldo projetado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="monthlyIncome">Valor (R$)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                step="0.01"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleIncomeUpdate}>Salvar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pessoas</CardTitle>
              <CardDescription>Gerencie as pessoas que dividem as contas</CardDescription>
            </div>
            <Dialog open={isPersonDialogOpen} onOpenChange={setIsPersonDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Pessoa</DialogTitle>
                  <DialogDescription>Digite o nome da nova pessoa</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="personName">Nome</Label>
                    <Input
                      id="personName"
                      value={newPersonName}
                      onChange={(e) => setNewPersonName(e.target.value)}
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsPersonDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddPerson}>Adicionar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {settings.people.map(person => (
              <div key={person.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <span className="font-medium">{person.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemovePerson(person.id)}
                  disabled={settings.people.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Categorias</CardTitle>
              <CardDescription>Gerencie as categorias de despesas e receitas</CardDescription>
            </div>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Categoria</DialogTitle>
                  <DialogDescription>Digite o nome e tipo da nova categoria</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryName">Nome</Label>
                    <Input
                      id="categoryName"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Ex: Transporte"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryType">Tipo</Label>
                    <Select value={newCategoryType} onValueChange={(value) => setNewCategoryType(value as 'expense' | 'income')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Despesa</SelectItem>
                        <SelectItem value="income">Receita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddCategory}>Adicionar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Categorias de Despesas</h4>
              <div className="space-y-2">
                {settings.expenseCategories.map(category => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="font-medium">{category.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Categorias de Receitas</h4>
              <div className="space-y-2">
                {settings.incomeCategories.map(category => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="font-medium">{category.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
