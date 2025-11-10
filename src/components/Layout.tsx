import { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, DollarSign, TrendingUp, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentTab = location.pathname.slice(1) || 'inicio';

  const handleTabChange = (value: string) => {
    navigate(value === 'inicio' ? '/' : `/${value}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">Divisão de Contas</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas finanças compartilhadas</p>
        </div>
      </header>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4">
            <TabsList className="w-full grid grid-cols-4 h-auto bg-transparent">
              <TabsTrigger 
                value="inicio" 
                className="flex flex-col gap-1 py-3 data-[state=active]:bg-secondary"
              >
                <Home className="h-5 w-5" />
                <span className="text-xs">Início</span>
              </TabsTrigger>
              <TabsTrigger 
                value="a-pagar" 
                className="flex flex-col gap-1 py-3 data-[state=active]:bg-secondary"
              >
                <DollarSign className="h-5 w-5" />
                <span className="text-xs">A Pagar</span>
              </TabsTrigger>
              <TabsTrigger 
                value="a-receber" 
                className="flex flex-col gap-1 py-3 data-[state=active]:bg-secondary"
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">A Receber</span>
              </TabsTrigger>
              <TabsTrigger 
                value="configuracoes" 
                className="flex flex-col gap-1 py-3 data-[state=active]:bg-secondary"
              >
                <Settings className="h-5 w-5" />
                <span className="text-xs">Configurações</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </Tabs>
    </div>
  );
};

export default Layout;
