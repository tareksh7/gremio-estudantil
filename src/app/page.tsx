"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AtSign, LogIn } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const [, setUser] = useLocalStorage('pr-school-vote-user', null);

  const handleLogin = () => {
    if (!email.toLowerCase().endsWith('@escola.pr.gov.br')) {
      toast({
        variant: "destructive",
        title: "Email Inválido",
        description: "Por favor, use seu email @escola.pr.gov.br.",
      });
      return;
    }

    const name = email.split('@')[0].replace(/\./g, ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase());
    setUser({ email, name });
    
    router.push('/vote');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center items-center">
          <Image 
            src="/logo-ayrton-tom.png" 
            alt="Logo Colégio Estadual Ayrton Senna e Tom Educação"
            width={200}
            height={200}
            className="mb-4"
            data-ai-hint="school logo"
          />
          <CardTitle className="font-headline text-2xl">Colégio Estadual Ayrton Senna</CardTitle>
          <CardDescription>Sistema de votação para o Grêmio Estudantil - Foz do Iguaçu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Institucional</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu.nome@escola.pr.gov.br" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && handleLogin()}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} className="w-full" size="lg">
            <LogIn className="mr-2 h-5 w-5" />
            Entrar
          </Button>
        </CardFooter>
      </Card>
      <div className="text-center mt-6 space-y-2">
        <Button variant="link" onClick={() => router.push('/results/auth')}>
          Ver Resultados
        </Button>
        <p className="text-muted-foreground text-xs px-8">
          Desenvolvido pelo Professor Tarek Shehade e os alunos do 3º ano de Desenvolvimento de Sistemas.
        </p>
      </div>
    </main>
  );
}
