import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { format, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const HomePage = () => {
  const { expenses, receivables, settings, selectedMonth } = useApp();

  // Filtrar por mês selecionado
  const monthExpenses = expenses.filter(exp => 
    isSameMonth(exp.dueDate, selectedMonth)
  );
  const monthReceivables = receivables.filter(rec => 
    isSameMonth(rec.dueDate, selectedMonth)
  );

  // Calcular totais
  const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalReceivables = monthReceivables.reduce((sum, rec) => sum + rec.amount, 0);
  const projectedBalance = settings.monthlyIncome + totalReceivables - totalExpenses;

  const paidExpenses = monthExpenses.filter(exp => exp.status === 'paid').length;
  const receivedItems = monthReceivables.filter(rec => rec.status === 'paid').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">
            {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Projetado</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${projectedBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
              R$ {projectedBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Renda + Recebíveis - Despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              R$ {totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {paidExpenses} de {monthExpenses.length} pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              R$ {totalReceivables.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {receivedItems} de {monthReceivables.length} recebidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Renda Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {settings.monthlyIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Configurado nas definições
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Despesas Pendentes</CardTitle>
            <CardDescription>Contas que ainda precisam ser pagas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthExpenses
                .filter(exp => exp.status === 'pending')
                .slice(0, 5)
                .map(expense => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{expense.description}</p>
                        {expense.isEssential && (
                          <Badge variant="outline" className="text-xs">Essencial</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vence em {format(expense.dueDate, "dd/MM/yyyy")}
                      </p>
                    </div>
                    <p className="font-bold text-destructive">
                      R$ {expense.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              {monthExpenses.filter(exp => exp.status === 'pending').length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma despesa pendente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recebíveis Pendentes</CardTitle>
            <CardDescription>Valores que ainda serão recebidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthReceivables
                .filter(rec => rec.status === 'pending')
                .slice(0, 5)
                .map(receivable => (
                  <div key={receivable.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{receivable.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Vence em {format(receivable.dueDate, "dd/MM/yyyy")}
                      </p>
                    </div>
                    <p className="font-bold text-success">
                      R$ {receivable.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              {monthReceivables.filter(rec => rec.status === 'pending').length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum recebível pendente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
