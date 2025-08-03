"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home } from 'lucide-react';

export default function ThankYouPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-2xl text-center">
        <CardHeader>
            <div className="mx-auto bg-green-500 text-white rounded-full p-3 w-fit mb-4">
                <CheckCircle size={32} />
            </div>
          <CardTitle className="font-headline text-3xl">Obrigado por Votar!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Sua participação é muito importante para o futuro da nossa escola.</p>
          <Button onClick={() => router.push('/')} className="mt-8 w-full" size="lg">
            <Home className="mr-2 h-5 w-5" />
            Voltar para o Início
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
