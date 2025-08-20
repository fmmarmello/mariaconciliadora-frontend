import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
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
  Tooltip, 
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando Maria Conciliadora...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Maria Conciliadora</h1>
                <p className="text-sm text-gray-500">Dashboard Financeiro Inteligente</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Sparkles className="h-3 w-3 mr-1" />
                IA Ativa
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 lg:w-[800px]">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="upload">Upload OFX</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="ai-training">IA Treinamento</TabsTrigger>
            <TabsTrigger value="predictions">Previsões</TabsTrigger>
            <TabsTrigger value="reconciliation">Reconciliação</TabsTrigger>
            <TabsTrigger value="test-data">Dados de Teste</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {summary && (
              <>
                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
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

                  <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
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

                  <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
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

                  <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
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
                            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
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
                          <Tooltip />
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
            <FileUpload onUploadSuccess={onUploadSuccess} />
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
          
          {/* AI Training Tab */}
          <TabsContent value="ai-training">
            <AITraining />
          </TabsContent>
          
          {/* Predictions Tab */}
          <TabsContent value="predictions">
            <FinancialPredictions />
          </TabsContent>
          
          {/* Reconciliation Tab */}
          <TabsContent value="reconciliation">
            <Reconciliation />
          </TabsContent>
          
          {/* Test Data Deletion Tab */}
          <TabsContent value="test-data">
            <TestDataDeletion />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App

