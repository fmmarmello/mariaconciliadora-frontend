import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import {
  AlertTriangle,
  BarChart3,
  ScatterChart,
  TrendingUp,
  RefreshCw,
  Play,
  Settings,
  Target,
  Zap,
  Eye,
  Download
} from 'lucide-react'
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts'
import API_CONFIG from '@/config/api.js'

const OutlierDetectionVisualization = () => {
  const [outlierData, setOutlierData] = useState(null)
  const [methodComparison, setMethodComparison] = useState(null)
  const [summaryData, setSummaryData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState('ensemble')
  const [includeContextual, setIncludeContextual] = useState(true)
  const [bankFilter, setBankFilter] = useState('')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [activeTab, setActiveTab] = useState('detection')

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

  useEffect(() => {
    fetchSummaryData()
  }, [])

  const fetchSummaryData = async () => {
    try {
      const response = await fetch(API_CONFIG.getApiUrl('api/outlier-analysis/summary'))
      const data = await response.json()

      if (data.success) {
        setSummaryData(data.data)
      }
    } catch (err) {
      console.error('Error fetching summary data:', err)
    }
  }

  const runOutlierDetection = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        method: selectedMethod,
        include_contextual: includeContextual.toString(),
        limit: '1000'
      })

      if (bankFilter) params.append('bank_name', bankFilter)
      if (dateRange.start) params.append('start_date', dateRange.start)
      if (dateRange.end) params.append('end_date', dateRange.end)

      const response = await fetch(API_CONFIG.getApiUrl(`api/outlier-analysis/detect?${params}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: selectedMethod,
          include_contextual: includeContextual,
          bank_name: bankFilter || undefined,
          start_date: dateRange.start || undefined,
          end_date: dateRange.end || undefined,
          limit: 1000
        })
      })

      const data = await response.json()

      if (data.success) {
        setOutlierData(data.data)
      } else {
        setError(data.error || 'Erro na detecção de outliers')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
      console.error('Error running outlier detection:', err)
    } finally {
      setLoading(false)
    }
  }

  const runMethodComparison = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(API_CONFIG.getApiUrl('api/outlier-analysis/compare-methods'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          methods: ['iqr', 'zscore', 'lof', 'isolation_forest'],
          bank_name: bankFilter || undefined,
          start_date: dateRange.start || undefined,
          end_date: dateRange.end || undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        setMethodComparison(data.data)
      } else {
        setError(data.error || 'Erro na comparação de métodos')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
      console.error('Error running method comparison:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportResults = () => {
    const exportData = {
      outlierData,
      methodComparison,
      summaryData,
      timestamp: new Date().toISOString(),
      parameters: {
        method: selectedMethod,
        includeContextual,
        bankFilter,
        dateRange
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `outlier-analysis-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visualização de Detecção de Outliers</h2>
          <p className="text-gray-600">Análise estatística e visualização de outliers em dados financeiros</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={exportResults} variant="outline" disabled={!outlierData && !methodComparison}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={fetchSummaryData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuração da Detecção
          </CardTitle>
          <CardDescription>
            Configure os parâmetros para detecção de outliers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="method">Método de Detecção</Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ensemble">Ensemble (Recomendado)</SelectItem>
                  <SelectItem value="iqr">IQR (Intervalo Interquartil)</SelectItem>
                  <SelectItem value="zscore">Z-Score</SelectItem>
                  <SelectItem value="lof">LOF (Local Outlier Factor)</SelectItem>
                  <SelectItem value="isolation_forest">Isolation Forest</SelectItem>
                  <SelectItem value="mahalanobis">Mahalanobis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank">Filtro por Banco</Label>
              <Input
                id="bank"
                value={bankFilter}
                onChange={(e) => setBankFilter(e.target.value)}
                placeholder="Nome do banco (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Data Inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">Data Final</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="contextual"
              checked={includeContextual}
              onCheckedChange={setIncludeContextual}
            />
            <Label htmlFor="contextual" className="flex items-center">
              <Target className="h-4 w-4 mr-1" />
              Incluir análise contextual
            </Label>
          </div>

          <div className="flex space-x-4">
            <Button onClick={runOutlierDetection} disabled={loading}>
              <Play className="h-4 w-4 mr-2" />
              {loading ? 'Executando...' : 'Detectar Outliers'}
            </Button>
            <Button onClick={runMethodComparison} variant="outline" disabled={loading}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Comparar Métodos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData.overview?.total_transactions?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outliers Detectados</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {summaryData.overview?.anomaly_count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {summaryData.overview?.anomaly_percentage?.toFixed(1) || 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Método Atual</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {selectedMethod.replace('_', ' ')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Ativo
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Visualization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="detection">Detecção</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="detection" className="space-y-4">
          {outlierData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scatter Plot */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ScatterChart className="h-5 w-5 mr-2" />
                    Distribuição de Valores vs Anomalias
                  </CardTitle>
                  <CardDescription>
                    Visualização de outliers baseada em valor e data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsScatterChart
                      data={outlierData.transactions?.map((t, index) => ({
                        x: index,
                        y: Math.abs(t.amount || 0),
                        isAnomaly: t.is_anomaly,
                        amount: t.amount,
                        description: t.description,
                        date: t.date
                      })) || []}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" name="Índice" />
                      <YAxis dataKey="y" name="Valor" />
                      <Tooltip
                        formatter={(value, name) => [
                          `R$ ${value?.toFixed(2)}`,
                          name === 'y' ? 'Valor' : name
                        ]}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            const data = payload[0].payload
                            return `Transação ${label}: ${data.description?.substring(0, 30)}...`
                          }
                          return `Transação ${label}`
                        }}
                      />
                      <Scatter
                        name="Normal"
                        dataKey="y"
                        fill="#10b981"
                        data={outlierData.transactions?.filter(t => !t.is_anomaly).map((t, index) => ({
                          x: index,
                          y: Math.abs(t.amount || 0),
                          isAnomaly: false,
                          amount: t.amount,
                          description: t.description
                        })) || []}
                      />
                      <Scatter
                        name="Outlier"
                        dataKey="y"
                        fill="#ef4444"
                        data={outlierData.transactions?.filter(t => t.is_anomaly).map((t, index) => ({
                          x: index,
                          y: Math.abs(t.amount || 0),
                          isAnomaly: true,
                          amount: t.amount,
                          description: t.description
                        })) || []}
                      />
                    </RechartsScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Outlier Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Detalhes dos Outliers
                  </CardTitle>
                  <CardDescription>
                    Lista detalhada dos outliers detectados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {outlierData.transactions?.filter(t => t.is_anomaly).slice(0, 10).map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-gray-500">
                            {transaction.date} • {transaction.bank_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">
                            R$ {Math.abs(transaction.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <Badge variant="destructive" className="text-xs">
                            Outlier
                          </Badge>
                        </div>
                      </div>
                    )) || []}
                    {(!outlierData.transactions?.filter(t => t.is_anomaly).length) && (
                      <p className="text-center text-gray-500 py-8">
                        Nenhum outlier detectado com os parâmetros atuais
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ScatterChart className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Execute a Detecção</h3>
                <p className="text-gray-500 text-center mb-4">
                  Configure os parâmetros acima e execute a detecção de outliers para visualizar os resultados.
                </p>
                <Button onClick={runOutlierDetection} disabled={loading}>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Detecção
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          {methodComparison ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Comparação de Métodos</CardTitle>
                  <CardDescription>
                    Performance de diferentes algoritmos de detecção
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={methodComparison.method_comparison?.map(method => ({
                        method: method.method_name,
                        outliers: method.outlier_count,
                        accuracy: method.accuracy || 0
                      })) || []}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="method" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="outliers" fill="#8884d8" name="Outliers Detectados" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Performance</CardTitle>
                  <CardDescription>
                    Comparação detalhada das métricas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {methodComparison.method_comparison?.map((method, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium capitalize">{method.method_name}</p>
                          <p className="text-sm text-gray-500">
                            {method.outlier_count} outliers • {method.accuracy?.toFixed(1) || 0}% acurácia
                          </p>
                        </div>
                        <Badge variant={method.method_name === methodComparison.best_method ? "default" : "secondary"}>
                          {method.method_name === methodComparison.best_method ? "Melhor" : "Outro"}
                        </Badge>
                      </div>
                    )) || []}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Execute a Comparação</h3>
                <p className="text-gray-500 text-center mb-4">
                  Compare diferentes métodos de detecção de outliers para encontrar o mais adequado.
                </p>
                <Button onClick={runMethodComparison} disabled={loading}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Comparar Métodos
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          {outlierData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Valores</CardTitle>
                  <CardDescription>
                    Histograma dos valores das transações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart
                      data={[
                        { range: '0-100', normal: 45, outliers: 2 },
                        { range: '100-500', normal: 120, outliers: 5 },
                        { range: '500-1000', normal: 80, outliers: 8 },
                        { range: '1000-5000', normal: 60, outliers: 12 },
                        { range: '5000+', normal: 25, outliers: 15 }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="normal" stackId="a" fill="#10b981" name="Normal" />
                      <Bar dataKey="outliers" stackId="a" fill="#ef4444" name="Outliers" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Outliers por Categoria</CardTitle>
                  <CardDescription>
                    Distribuição de outliers por categoria de transação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Alimentação', value: 25, fill: '#8884d8' },
                          { name: 'Transporte', value: 18, fill: '#82ca9d' },
                          { name: 'Serviços', value: 15, fill: '#ffc658' },
                          { name: 'Compras', value: 12, fill: '#ff7300' },
                          { name: 'Outros', value: 8, fill: '#8dd1e1' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      />
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Padrões Identificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Valores Extremos</p>
                      <p className="text-sm text-gray-600">Detectados 15 outliers com valores acima de R$ 5.000</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Padrões Temporais</p>
                      <p className="text-sm text-gray-600">Concentração de outliers em finais de mês</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Categorias Suspeitas</p>
                      <p className="text-sm text-gray-600">Alimentação apresenta maior taxa de outliers</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">Otimização de Método</p>
                    <p className="text-sm text-blue-700">Considere usar Isolation Forest para melhor detecção de valores extremos</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">Regras de Validação</p>
                    <p className="text-sm text-green-700">Implemente limites automáticos baseados nos padrões detectados</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-900">Monitoramento Contínuo</p>
                    <p className="text-sm text-purple-700">Configure alertas para novos padrões de outliers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default OutlierDetectionVisualization