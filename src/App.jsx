import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.jsx'
import { Skeleton } from '@/components/ui/skeleton.jsx'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet.jsx'
import { 
  Upload, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  PieChart, 
  BarChart3,
  AlertTriangle,
  FileText,
  Brain,
  Sparkles
} from 'lucide-react'
import {
   LineChart,
   Line,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip as RechartsTooltip,
   ResponsiveContainer,
   PieChart as RechartsPieChart,
   Pie,
   Cell,
   BarChart,
   Bar
 } from 'recharts'
import API_CONFIG from '@/config/api.js'
import './App.css'

// Componentes
import FileUpload from './components/FileUpload'
import TransactionsList from './components/TransactionsList'
import InsightsPanel from './components/InsightsPanel'
import FinancialTracker from './components/FinancialTracker'
import AITraining from './components/AITraining'
import FinancialPredictions from './components/FinancialPredictions'
import Reconciliation from './components/Reconciliation'
import TestDataDeletion from './components/TestDataDeletion'
import XLSXAnalysisTest from './components/XLSXAnalysisTest'
import ImportData from './components/ImportData'

function App() {
  const [summary, setSummary] = useState(null)
  const [insights, setInsights] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Cores para os gráficos
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0']

  useEffect(() => {
    fetchSummary()
    fetchInsights()
    fetchTransactions()
  }, [])

  const fetchSummary = async () => {
    try {
      const response = await fetch(API_CONFIG.getApiUrl('api/summary'))
      const data = await response.json()
      if (data.success) {
        setSummary(data.data)
      }
    } catch (error) {
      console.error('Erro ao buscar resumo:', error)
    }
  }

  const fetchInsights = async () => {
    try {
      const response = await fetch(API_CONFIG.getApiUrl('api/insights'))
      const data = await response.json()
      if (data.success) {
        setInsights(data.data)
      }
    } catch (error) {
      console.error('Erro ao buscar insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch(API_CONFIG.getApiUrl('api/transactions?limit=50'))
      const data = await response.json()
      if (data.success) {
        setTransactions(data.data.transactions)
      }
    } catch (error) {
      console.error('Erro ao buscar transações:', error)
    }
  }

  const onUploadSuccess = () => {
    fetchSummary()
    fetchInsights()
    fetchTransactions()
  }

  if (loading) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* Header Skeleton */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Skeleton */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              {/* Tabs Skeleton */}
              <Skeleton className="h-10 w-full max-w-4xl" />

              {/* Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-20 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg cursor-help">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>IA Maria Conciliadora - Sistema de Reconciliação Inteligente</p>
                </TooltipContent>
              </Tooltip>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Maria Conciliadora</h1>
                <p className="text-sm text-gray-500">Dashboard Financeiro Inteligente</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 cursor-help">
                    <Sparkles className="h-3 w-3 mr-1" />
                    IA Ativa
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sistema de IA está ativo e processando dados em tempo real</p>
                </TooltipContent>
              </Tooltip>
              {summary && summary.overview.anomalies_count > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="destructive" className="bg-red-100 text-red-800 cursor-help">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {summary.overview.anomalies_count} anomalias
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clique para ver detalhes das anomalias detectadas</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-3">
            <span className="text-sm text-gray-500">Dashboard</span>
            <span className="text-gray-400">/</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {activeTab === 'overview' ? 'Visão Geral' :
               activeTab === 'upload' ? 'Importar Extratos' :
               activeTab === 'reconciliation' ? 'Conciliação' :
               activeTab === 'transactions' ? 'Transações' :
               activeTab === 'insights' ? 'Análises' :
               activeTab === 'financial' ? 'Fluxo de Caixa' :
               activeTab === 'predictions' ? 'Previsões' :
               activeTab === 'dev-tools' ? 'Ferramentas (Dev)' :
               activeTab === 'anomalies' ? 'Anomalias' :
               activeTab}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="hidden lg:block flex-1">
              <TabsList className="grid w-full grid-cols-8 lg:w-[1000px]">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="upload">Importar Extratos</TabsTrigger>
                <TabsTrigger value="reconciliation">Conciliação</TabsTrigger>
                <TabsTrigger value="transactions">Transações</TabsTrigger>
                <TabsTrigger value="insights">Análises</TabsTrigger>
                <TabsTrigger value="financial">Fluxo de Caixa</TabsTrigger>
                <TabsTrigger value="predictions">Previsões</TabsTrigger>
                <TabsTrigger value="dev-tools">Ferramentas (Dev)</TabsTrigger>
              </TabsList>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    Menu
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Navegação</SheetTitle>
                    <SheetDescription>
                      Selecione uma seção para navegar
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-2 py-4">
                    {[
                      { value: 'overview', label: 'Visão Geral' },
                      { value: 'upload', label: 'Importar Extratos' },
                      { value: 'reconciliation', label: 'Conciliação' },
                      { value: 'transactions', label: 'Transações' },
                      { value: 'insights', label: 'Análises' },
                      { value: 'financial', label: 'Fluxo de Caixa' },
                      { value: 'predictions', label: 'Previsões' },
                      { value: 'dev-tools', label: 'Ferramentas (Dev)' }
                    ].map((tab) => (
                      <Button
                        key={tab.value}
                        variant={activeTab === tab.value ? "default" : "ghost"}
                        className="justify-start"
                        onClick={() => setActiveTab(tab.value)}
                      >
                        {tab.label}
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {summary && (
              <>
                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white cursor-help hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
                          <TrendingUp className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            R$ {summary.overview.total_credits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total de todas as receitas processadas no sistema</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white cursor-help hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
                          <TrendingDown className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            R$ {summary.overview.total_debits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total de todos os gastos processados no sistema</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-help hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
                          <DollarSign className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            R$ {summary.overview.net_flow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Diferença entre receitas e gastos (Receitas - Gastos)</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white cursor-help hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Transações</CardTitle>
                          <CreditCard className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{summary.overview.total_transactions}</div>
                          {summary.overview.anomalies_count > 0 && (
                            <div className="flex items-center mt-2">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              <span className="text-xs">{summary.overview.anomalies_count} anomalias</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total de transações processadas • Anomalias detectadas pela IA</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de Categorias */}
                  {summary.categories && summary.categories.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <PieChart className="h-5 w-5 mr-2" />
                          Gastos por Categoria
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsPieChart>
                            <Pie
                              data={summary.categories.map(cat => ({
                                name: cat.name,
                                value: Math.abs(cat.total)
                              }))}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {summary.categories.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Bancos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Transações por Banco
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={summary.banks}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Transações Recentes */}
                {summary.recent_transactions && summary.recent_transactions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Transações Recentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {summary.recent_transactions.map((transaction, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{transaction.description}</p>
                              <p className="text-xs text-gray-500">
                                {transaction.bank_name} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.amount > 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!summary && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado encontrado</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Faça upload de seus arquivos OFX para começar a ver insights sobre suas finanças.
                  </p>
                  <Button onClick={() => setActiveTab('upload')}>
                    Fazer Upload
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <ImportData onUploadSuccess={onUploadSuccess} />
          </TabsContent>

          {/* Dev Tools Tab (with subtabs) */}
          <TabsContent value="dev-tools">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ferramentas (Dev)</CardTitle>
                  <CardDescription>Utilitários internos para desenvolvimento e testes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="ai" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                      <TabsTrigger value="ai">Regras & IA</TabsTrigger>
                      <TabsTrigger value="xlsx">Análise XLSX</TabsTrigger>
                      <TabsTrigger value="test">Dados de Teste</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai">
                      <AITraining />
                    </TabsContent>
                    <TabsContent value="xlsx">
                      <XLSXAnalysisTest />
                    </TabsContent>
                    <TabsContent value="test">
                      <TestDataDeletion />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <TransactionsList transactions={transactions} />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <InsightsPanel insights={insights} />
          </TabsContent>
          
          {/* Financial Tracking Tab */}
          <TabsContent value="financial">
            <FinancialTracker />
          </TabsContent>
          
          
          
          {/* Predictions Tab */}
          <TabsContent value="predictions">
            <FinancialPredictions />
          </TabsContent>
          
          {/* Reconciliation Tab */}
          <TabsContent value="reconciliation">
            <Reconciliation />
          </TabsContent>
          
        </Tabs>
      </main>
    </div>
    </TooltipProvider>
  )
}

export default App
