"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, ShieldCheck, Loader2 } from 'lucide-react';

// A senha está hardcoded aqui para simplicidade.
// Em um aplicativo real, isso deve ser validado no servidor.
const ADMIN_PASSWORD = "admin";

export default function ResultsAuthPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = () => {
    setLoading(true);
    // Simula uma pequena demora para dar feedback ao usuário
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        try {
          sessionStorage.setItem('results-auth', 'true');
          router.push('/results');
        } catch (error) {
           console.error("Failed to set session storage or redirect", error);
           toast({
            variant: "destructive",
            title: "Erro de Navegação",
            description: "Não foi possível redirecionar para a página de resultados.",
          });
          setLoading(false);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Senha Incorreta",
          description: "Você não tem permissão para ver os resultados.",
        });
        setLoading(false);
      }
    }, 500);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
                <ShieldCheck size={32} />
            </div>
          <CardTitle className="font-headline text-2xl">Acesso Restrito</CardTitle>
          <CardDescription>Insira a senha de administrador para ver os resultados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="********" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && !loading && handleAuth()}
                  disabled={loading}
                  className="pl-10"
                />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAuth} className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? 'Verificando...' : 'Acessar Resultados'}
          </Button>
        </CardFooter>
      </Card>
       <Button variant="link" onClick={() => router.push('/')} className="mt-4">
            Voltar para o Início
        </Button>
    </main>
  );
}
