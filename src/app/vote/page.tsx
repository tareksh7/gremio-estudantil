"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Users, Ban, ArrowRight, VoteIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

interface VoteOption {
  id: 'Chapa 1' | 'Chapa 2' | 'Chapa 3' | 'Voto Nulo';
  title: string;
  description: string;
  icon: React.ElementType;
  image: string;
  imageHint: string;
}

const voteOptions: VoteOption[] = [
  { id: 'Chapa 1', title: 'Inovação & Futuro', description: 'Um novo amanhã para nossa escola.', icon: Users, image: 'https://placehold.co/600x400.png', imageHint: 'team innovation' },
  { id: 'Chapa 2', title: 'Tradição & Força', description: 'Valorizando o que temos de melhor.', icon: Users, image: 'https://placehold.co/600x400.png', imageHint: 'students tradition' },
  { id: 'Chapa 3', title: 'Voz Ativa', description: 'Participação e representatividade para todos.', icon: Users, image: 'https://placehold.co/600x400.png', imageHint: 'students voice' },
  { id: 'Voto Nulo', title: 'Voto Nulo', description: 'Nenhuma das opções.', icon: Ban, image: 'https://placehold.co/600x400.png', imageHint: 'blank slate' },
];

export default function VotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user] = useLocalStorage('pr-school-vote-user', { name: '', email: '' });
  const [voted, setVoted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!user || !user.email) {
      router.replace('/');
      return;
    }
    
    const checkVoteStatus = async () => {
        setLoading(true);
        const votesRef = collection(db, "votes");
        const q = query(votesRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        setVoted(!querySnapshot.empty);
        setLoading(false);
    };

    checkVoteStatus();
  }, [user, router]);

  const handleVote = async (optionId: VoteOption['id']) => {
    if (voted) {
      toast({
        title: "Voto já registrado",
        description: "Você já votou com este email.",
      });
      return;
    }
    setLoading(true);

    try {
        await addDoc(collection(db, "votes"), {
            email: user.email,
            name: user.name,
            vote: optionId,
            timestamp: new Date(),
        });

        setVoted(true);
        toast({
            title: "Voto Confirmado!",
            description: `Obrigado por votar, ${user.name}! Seu voto foi para ${optionId}.`,
        });
        router.push('/thank-you');
    } catch (error) {
        console.error("Error adding document: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao Votar",
            description: "Não foi possível registrar seu voto. Tente novamente.",
        });
    } finally {
        setLoading(false);
    }
  };
  
  if (voted === null || (!user || !user.email)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8">
      <header className="flex flex-wrap gap-4 justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-headline">Olá, {user.name}!</h1>
          <p className="text-muted-foreground">Bem-vindo(a) à votação. Escolha sua chapa abaixo.</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/results/auth')}>
          Ver Resultados
          <ArrowRight className="ml-2 h-4 w-4"/>
        </Button>
      </header>

      <div className="space-y-8">
        {voted && (
          <Alert variant="destructive">
            <VoteIcon className="h-4 w-4" />
            <AlertTitle>Voto já registrado!</AlertTitle>
            <AlertDescription>
              Seu e-mail ({user.email}) já foi utilizado para votar. Cada pessoa pode votar apenas uma vez.
            </AlertDescription>
          </Alert>
        )}
        
        <div>
            <h2 className="text-2xl font-headline mb-4">Escolha sua chapa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {voteOptions.map((option) => (
                    <Card key={option.id} className="overflow-hidden flex flex-col transform hover:scale-[1.02] transition-transform duration-300 shadow-lg">
                        <Image src={option.image} alt={option.title} width={600} height={400} className="w-full h-40 object-cover" data-ai-hint={option.imageHint} />
                        <div className="flex flex-col flex-grow">
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                  <option.icon /> {option.title}
                              </CardTitle>
                              <CardDescription>{option.description}</CardDescription>
                          </CardHeader>
                          <CardFooter className="mt-auto">
                              <Button className="w-full" onClick={() => handleVote(option.id)} disabled={voted || loading}>
                                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  {voted ? 'Você já votou' : `Votar em ${option.title}`}
                              </Button>
                          </CardFooter>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
