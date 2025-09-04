import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  Calendar,
  PieChart,
  BarChart3,
  Sparkles,
  RefreshCw,
  MessageSquare
} from 'lucide-react'
import API_CONFIG from '@/config/api.js'
import { get, ApiError } from '@/services/apiService.js';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip.jsx'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

const InsightsPanel = ({ insights: initialInsights }) => {
  const [insights, setInsights] = useState(initialInsights)
  const [aiInsights, setAiInsights] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (initialInsights) {
      setInsights(initialInsights)
    } else {
      fetchInsights()
    }
  }, [initialInsights])

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const data = await get('api/insights/general')
      
      if (data.success) {
        setInsights(data.data)
      } else {
        // Handle cases where API returns success: false but no ApiError is thrown
        setError(data.message || 'Erro desconhecido ao buscar insights.')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Erro ao buscar insights:', error.message)
        setError(error.message)
      } else {
        console.error('Erro inesperado ao buscar insights:', error)
        setError('Erro inesperado ao buscar insights.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchAiInsights = async () => {
    setAiLoading(true)
    try {
      const data = await get('api/insights/ai')
      
      if (data.success) {
        setAiInsights(data.data.ai_insights)
      } else {
        setError(data.message || 'Erro desconhecido ao buscar insights de IA.')
        setAiInsights('Erro ao gerar insights com IA. Verifique se as chaves de API estão configuradas.')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Erro ao buscar insights de IA:', error.message)
        setError(error.message)
        setAiInsights(`Erro ao gerar insights com IA: ${error.message}`)
      } else {
        console.error('Erro inesperado ao buscar insights de IA:', error)
        setError('Erro inesperado ao buscar insights de IA.')
        setAiInsights('Erro inesperado ao gerar insights com IA.')
      }
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!insights || insights.error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum insight disponível</h3>
          <p className="text-gray-500 text-center mb-4">
            {insights?.error || 'Faça upload de arquivos OFX para gerar insights inteligentes sobre suas finanças.'}
          </p>
          <Button onClick={fetchInsights}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Prepara dados para gráficos
  const weekdayData = insights.patterns?.weekday_spending ? 
    Object.entries(insights.patterns.weekday_spending).map(([day, amount]) => ({
      day,
      amount: parseFloat(amount) || 0
    })) : []

  const categoryData = insights.categories ? 
    Object.entries(insights.categories).map(([category, data]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount: data.total_spent || 0,
      percentage: data.percentage_of_expenses || 0
    })).sort((a, b) => b.amount - a.amount).slice(0, 8) : []

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      {insights.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.summary.total_transactions}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {insights.summary.total_credits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Gastos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {insights.summary.total_debits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-r ${
            insights.summary.net_flow >= 0 
              ? 'from-emerald-500 to-emerald-600' 
              : 'from-orange-500 to-orange-600'
          } text-white`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {insights.summary.net_flow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos de Análise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos por Categoria */}
        {categoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Gastos por Categoria
              </CardTitle>
              <CardDescription>
                Distribuição dos seus gastos por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                    interval={0}
                    tick={({ x, y, payload }) => (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <g transform={`translate(${x},${y})`}>
                              <text
                                x={0}
                                y={0}
                                dy={16}
                                textAnchor="end"
                                fill="#666"
                                transform="rotate(-45)"
                              >
                                {payload.value.length > 10
                                  ? `${payload.value.substring(0, 10)}...`
                                  : payload.value}
                              </text>
                            </g>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{payload.value}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                  />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Gastos por Dia da Semana */}
        {weekdayData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Gastos por Dia da Semana
              </CardTitle>
              <CardDescription>
                Padrão de gastos ao longo da semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weekdayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                  />
                  <Bar dataKey="amount" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Anomalias */}
      {insights.anomalies && insights.anomalies.total_anomalies > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Transações Anômalas Detectadas
            </CardTitle>
            <CardDescription>
              A IA identificou {insights.anomalies.total_anomalies} transação(ões) incomum(ns) ({insights.anomalies.anomaly_percentage}% do total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.anomalies.anomalous_transactions?.slice(0, 3).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="font-bold text-orange-600">
                    R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Padrões Identificados */}
      {insights.patterns && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Padrões Identificados
            </CardTitle>
            <CardDescription>
              Insights sobre seus hábitos financeiros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.patterns.highest_spending_day && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Dia do mês com mais gastos</p>
                    <p className="text-sm text-gray-600">
                      Dia {insights.patterns.highest_spending_day} - R$ {insights.patterns.highest_spending_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendações */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Lightbulb className="h-5 w-5 mr-2" />
              Recomendações Inteligentes
            </CardTitle>
            <CardDescription>
              Sugestões personalizadas baseadas na análise dos seus dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.recommendations.map((recommendation, index) => (
                <Alert key={index} className="border-green-200 bg-green-50">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {recommendation}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights de IA Generativa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Análise Inteligente com IA
          </CardTitle>
          <CardDescription>
            Insights gerados por inteligência artificial sobre suas finanças
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aiInsights ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-800 whitespace-pre-line">{aiInsights}</p>
              </div>
              <Button variant="outline" onClick={fetchAiInsights} disabled={aiLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${aiLoading ? 'animate-spin' : ''}`} />
                Gerar Nova Análise
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Button onClick={fetchAiInsights} disabled={aiLoading}>
                {aiLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Gerando Insights...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Gerar Insights com IA
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Clique para gerar uma análise detalhada das suas finanças usando IA
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default InsightsPanel

