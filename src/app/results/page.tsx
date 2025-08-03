"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, RefreshCw, Vote, ChevronDown, ChevronUp, Loader2, AlertTriangle, Download, FileText } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

interface IndividualVote {
  id: string;
  email: string;
  name: string;
  vote: string;
}

interface VoteCounts {
  [key: string]: number;
}

export default function ResultsPage() {
  const router = useRouter();
  const [individualVotes, setIndividualVotes] = useState<IndividualVote[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStatus = sessionStorage.getItem('results-auth') === 'true';
      setIsAuthenticated(authStatus);
      if (!authStatus) {
        router.replace('/results/auth');
      }
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchVotes = async () => {
        setLoading(true);
        setError(null);
        try {
          const querySnapshot = await getDocs(collection(db, "votes"));
          const votesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IndividualVote));
          
          if (votesData.length === 0) {
            console.log("Nenhum voto encontrado no Firestore.");
          }

          setIndividualVotes(votesData);

          const counts: VoteCounts = {
            'Chapa 1': 0,
            'Chapa 2': 0,
            'Chapa 3': 0,
            'Voto Nulo': 0,
          };

          votesData.forEach(vote => {
            if (counts.hasOwnProperty(vote.vote)) {
              counts[vote.vote]++;
            }
          });
          
          const data = Object.entries(counts).map(([name, votes]) => ({ name, votes })).sort((a, b) => b.votes - a.votes);
          setChartData(data);
        } catch (err) {
            console.error("Erro ao buscar votos do Firestore:", err);
            setError("Falha ao carregar os votos do banco de dados. Verifique a configuração do seu projeto Firebase, se o Firestore está ativado e se as regras de segurança permitem a leitura da coleção 'votes'.");
        } finally {
            setLoading(false);
        }
      };

      fetchVotes();
    }
  }, [isAuthenticated]);

  const totalVotes = individualVotes.length;

  const resetVotes = async () => {
    if (window.confirm("Você tem certeza que deseja apagar TODOS os votos do banco de dados? Esta ação não pode ser desfeita.")) {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "votes"));
        const batch = writeBatch(db);
        querySnapshot.docs.forEach((docRef) => {
            batch.delete(doc(db, "votes", docRef.id));
        });
        await batch.commit();
        
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('results-auth');
        }

        alert("Votos zerados com sucesso! A página será recarregada.");
        window.location.reload();
      } catch (err) {
        console.error(err);
        setError("Falha ao zerar os votos. Verifique as permissões do Firestore.");
        setLoading(false);
      }
    }
  };

  const exportToCSV = () => {
    if (individualVotes.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    const headers = ['Nome', 'Email', 'Voto'];
    const csvData = individualVotes.map(vote => [
      vote.name,
      vote.email,
      vote.vote
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `resultados-votacao-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (individualVotes.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }
     const logoUrl = `${window.location.origin}/logo.png`;


    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Resultados da Votação</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { display: flex; align-items: center; margin-bottom: 20px; }
          .logo { height: 100px; margin-right: 20px; }
          h1 { color: #2563eb; text-align: center; margin-bottom: 30px; }
          .summary { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; }
          .summary h2 { color: #495057; margin-top: 0; }
          .results-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
          .result-card { border: 2px solid #e9ecef; padding: 20px; text-align: center; border-radius: 8px; background-color: #fff; }
          .result-card h3 { margin: 0 0 10px 0; color: #495057; }
          .result-number { font-size: 2.5em; font-weight: bold; color: #2563eb; margin: 10px 0; }
          .percentage { color: #6c757d; font-size: 0.9em; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #dee2e6; padding: 12px; text-align: left; }
          th { background-color: #e9ecef; font-weight: bold; color: #495057; }
          tr:nth-child(even) { background-color: #f8f9fa; }
          .footer { margin-top: 30px; text-align: center; color: #6c757d; font-size: 0.9em; border-top: 1px solid #dee2e6; padding-top: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
      <div class="header">
        <img src="${logoUrl}" class="logo" alt="Logo da Votação">
        <h1>Resultados da Votação</h1>
      </div>
      
        
        <div class="summary">
          <h2>📋 Raaesumo dos Resultados</h2>
          <p><strong>Total de votos:</strong> ${totalVotes}</p>
          <p><strong>Data do relatório:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        </div>

        <div class="results-grid">
          ${chartData.map(item => `
            <div class="result-card">
              <h3>${item.name}</h3>
              <div class="result-number">${item.votes}</div>
              <p class="percentage">${((item.votes / totalVotes) * 100).toFixed(1)}% dos votos</p>
            </div>
          `).join('')}
        </div>

        <h2>📝 Detalhes dos Votos</h2>
        <table>
          <thead>
            <tr>
              <th>Nome do Eleitor</th>
              <th>Email</th>
              <th>Voto</th>
            </tr>
          </thead>
          <tbody>
            ${individualVotes.sort((a,b) => a.name.localeCompare(b.name)).map(vote => `
              <tr>
                <td>${vote.name}</td>
                <td>${vote.email}</td>
                <td><strong>${vote.vote}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>🏫 Relatório gerado automaticamente pelo Sistema de Votação Escolar</p>
          <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    } else {
      alert('Por favor, permita pop-ups para gerar o PDF.');
    }
  };

  const chartConfig = {
      votes: {
        label: "Votos",
        color: "hsl(var(--primary))",
      },
  } satisfies import("@/components/ui/chart").ChartConfig

  if (isAuthenticated === null) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Verificando autenticação...</p>
        </div>
     );
  }
  
  if (!isAuthenticated) {
     return <div className="flex min-h-screen items-center justify-center">Redirecionando para a página de autenticação...</div>;
  }

  if (loading) {
     return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Carregando resultados do Firestore...</p>
        </div>
     );
  }

  if (error) {
    return (
        <main className="min-h-screen container mx-auto p-4 md:p-8">
             <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle /> Erro de Conexão com o Firestore</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Pressione F12 para abrir o console do desenvolvedor e ver detalhes do erro. Para ajuda, consulte a documentação do Firebase sobre Regras de Segurança.</p>
                     <Button onClick={() => window.location.reload()} className="mt-4">Tentar Novamente</Button>
                </CardContent>
             </Card>
        </main>
    )
  }

  return (
    <main className="min-h-screen container mx-auto p-4 md:p-8">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h1 className="flex items-center gap-2 text-4xl font-headline">
  <img 
    src="./logo.png" 
    alt="Logo da Votação" 
    width={88}  // Tamanho em pixels
    height={88}
    className="inline-block" // Para alinhar corretamente com o texto
  />
   Resultados da Votação 📊
</h1>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => router.push('/')}>
            <Home className="mr-2 h-4 w-4"/> Início
          </Button>
          {totalVotes > 0 && (
            <>
              <Button variant="outline" onClick={exportToCSV} className="bg-green-50 hover:bg-green-100 border-green-200">
                <Download className="mr-2 h-4 w-4"/> CSV
              </Button>
              <Button variant="outline" onClick={exportToPDF} className="bg-blue-50 hover:bg-blue-100 border-blue-200">
                <FileText className="mr-2 h-4 w-4"/> PDF
              </Button>
            </>
          )}
          <Button variant="destructive" onClick={resetVotes} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4"/> Zerar Votos
          </Button>
        </div>
      </div>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Contagem de Votos</CardTitle>
          <CardDescription>Total de {totalVotes} votos registrados no Firestore.</CardDescription>
        </CardHeader>
        <CardContent>
          {totalVotes > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full max-h-[400px]">
              <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 100 }}>
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} width={100} />
                <XAxis dataKey="votes" type="number" hide />
                <Tooltip
                    cursor={{fill: "hsl(var(--accent))", opacity: 0.2}}
                    content={<ChartTooltipContent indicator="dot" hideLabel />}
                />
                <Bar dataKey="votes" fill="hsl(var(--primary))" radius={5} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="text-center py-12">
              <Vote className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Nenhum voto foi registrado ainda no Firestore.</p>
              <Button className="mt-4" onClick={() => router.push('/vote')}>Seja o primeiro a votar!</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {chartData.map((item) => (
          <Card key={item.name} className="text-center">
            <CardHeader>
              <CardTitle className="text-xl">{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-primary">{item.votes}</p>
              <p className="text-sm text-muted-foreground">votos</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalVotes > 0 && (
         <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen} className="mt-8">
          <Card className="shadow-xl">
            <CollapsibleTrigger asChild>
                <CardHeader className="flex flex-row items-center justify-between cursor-pointer">
                    <div>
                        <CardTitle>Detalhes dos Votos</CardTitle>
                        <CardDescription>Veja quem votou em cada opção.</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                        {isDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        <span className="sr-only">Toggle Details</span>
                    </Button>
                </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Eleitor(a)</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead className="text-right">Voto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {individualVotes.sort((a,b) => a.name.localeCompare(b.name)).map((vote, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{vote.name}</TableCell>
                          <TableCell>{vote.email}</TableCell>
                          <TableCell className="text-right">{vote.vote}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </main>
  );
}