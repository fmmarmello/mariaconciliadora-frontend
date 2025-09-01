import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import {
  Database,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  TrendingUp,
  RefreshCw,
  Download,
  Target,
  Zap,
  Eye,
  Settings
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts'
import API_CONFIG from '@/config/api.js'

const DataCompletenessAnalyzer = () => {
  const [completenessData, setCompletenessData] = useState(null)
  const [fieldAnalysis, setFieldAnalysis] = useState(null)
  const [imputationData, setImputationData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTable, setSelectedTable] = useState('transactions')
  const [selectedField, setSelectedField] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

  useEffect(() => {
    fetchCompletenessData()
  }, [selectedTable])

  const fetchCompletenessData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(API_CONFIG.getApiUrl('api/data-quality/completeness/analysis'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_source: 'database',
          table_name: selectedTable,
          filters: { date_range: 'last_30_days' }
        })
      })

      const data = await response.json()

      if (data.success) {
        setCompletenessData(data.data)
      } else {
        setError(data.error || 'Erro ao carregar dados de completude')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
      console.error('Error fetching completeness data:', err)
    } finally {
      setLoading(false)
    }
  }

  const analyzeField = async (fieldName) => {
    if (!fieldName) return

    try {
      const response = await fetch(API_CONFIG.getApiUrl(`api/data-quality/completeness/field/${fieldName}?table=${selectedTable}&limit=1000`))
      const data = await response.json()

      if (data.success) {
        setFieldAnalysis(data.data)
      }
    } catch (err) {
      console.error('Error analyzing field:', err)
    }
  }

  const runImputationAnalysis = async () => {
    try {
      const response = await fetch(API_CONFIG.getApiUrl('api/data-quality/imputation/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_source: 'database',
          table_name: selectedTable
        })
      })

      const data = await response.json()

      if (data.success) {
        setImputationData(data.data)
      }
    } catch (err) {
      console.error('Error running imputation analysis:', err)
    }
  }

  const exportCompletenessReport = () => {
    const reportData = {
      completenessData,
      fieldAnalysis,
      imputationData,
      table: selectedTable,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `completude-${selectedTable}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }


  const getCompletenessStatus = (percentage) => {
    if (percentage >= 95) return { status: 'Excelente', color: 'text-green-600' }
    if (percentage >= 80) return { status: 'Bom', color: 'text-yellow-600' }
    if (percentage >= 60) return { status: 'Regular', color: 'text-orange-600' }
    return { status: 'Crítico', color: 'text-red-600' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analisador de Completude de Dados</h2>
          <p className="text-gray-600">Análise detalhada da completude e padrões de dados faltantes</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTable} onValueChange={setSelectedTable}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transactions">Transações</SelectItem>
              <SelectItem value="company_financial">Dados Financeiros</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchCompletenessData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={exportCompletenessReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {completenessData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completude Geral</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(completenessData.completeness_report?.dataset_completeness * 100).toFixed(1)}%
              </div>
              <Progress
                value={completenessData.completeness_report?.dataset_completeness * 100}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {getCompletenessStatus(completenessData.completeness_report?.dataset_completeness * 100).status}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registros Analisados</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completenessData.total_records?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de registros na tabela
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campos Críticos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {Object.values(completenessData.completeness_report?.critical_fields || {})
                  .filter(field => !field.meets_threshold).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Campos abaixo do threshold
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Padrões de Falta</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completenessData.completeness_report?.missing_patterns?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Padrões identificados
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="fields">Campos</TabsTrigger>
          <TabsTrigger value="patterns">Padrões</TabsTrigger>
          <TabsTrigger value="imputation">Imputação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {completenessData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Completeness by Field */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Completude por Campo
                  </CardTitle>
                  <CardDescription>
                    Percentual de completude para cada campo da tabela
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={Object.entries(completenessData.completeness_report?.field_completeness || {}).map(([field, data]) => ({
                        field: field.charAt(0).toUpperCase() + field.slice(1),
                        completeness: data.completeness_percentage,
                        missing: data.missing_count,
                        total: data.total_count
                      }))}
                      layout="horizontal"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="field" type="category" width={120} />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'completeness' ? `${value.toFixed(1)}%` : value.toLocaleString(),
                          name === 'completeness' ? 'Completude' : name === 'missing' ? 'Faltantes' : 'Total'
                        ]}
                      />
                      <Bar dataKey="completeness" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Completeness Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Distribuição de Completude
                  </CardTitle>
                  <CardDescription>
                    Distribuição dos níveis de completude
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          {
                            name: 'Excelente (≥95%)',
                            value: Object.values(completenessData.completeness_report?.field_completeness || {})
                              .filter(field => field.completeness_percentage >= 95).length,
                            fill: '#10b981'
                          },
                          {
                            name: 'Bom (80-94%)',
                            value: Object.values(completenessData.completeness_report?.field_completeness || {})
                              .filter(field => field.completeness_percentage >= 80 && field.completeness_percentage < 95).length,
                            fill: '#f59e0b'
                          },
                          {
                            name: 'Regular (60-79%)',
                            value: Object.values(completenessData.completeness_report?.field_completeness || {})
                              .filter(field => field.completeness_percentage >= 60 && field.completeness_percentage < 80).length,
                            fill: '#f97316'
                          },
                          {
                            name: 'Crítico (<60%)',
                            value: Object.values(completenessData.completeness_report?.field_completeness || {})
                              .filter(field => field.completeness_percentage < 60).length,
                            fill: '#ef4444'
                          }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, value, percent }) =>
                          value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : ''
                        }
                      />
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Database className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Carregando Análise</h3>
                <p className="text-gray-500 text-center mb-4">
                  Aguarde enquanto analisamos a completude dos dados...
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="fields" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Field Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Análise Detalhada de Campo</CardTitle>
                <CardDescription>
                  Selecione um campo para análise detalhada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="field-select">Campo</Label>
                  <Select value={selectedField} onValueChange={(value) => {
                    setSelectedField(value)
                    analyzeField(value)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um campo" />
                    </SelectTrigger>
                    <SelectContent>
                      {completenessData && Object.keys(completenessData.completeness_report?.field_completeness || {}).map(field => (
                        <SelectItem key={field} value={field}>
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {fieldAnalysis && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {fieldAnalysis.field_analysis?.completeness_percentage?.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Completude</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {fieldAnalysis.field_analysis?.missing_count}
                        </div>
                        <div className="text-sm text-gray-600">Valores Faltantes</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Estatísticas do Campo</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total de Registros:</span>
                          <span className="ml-2 font-medium">{fieldAnalysis.records_analyzed}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Registros Completos:</span>
                          <span className="ml-2 font-medium">
                            {fieldAnalysis.records_analyzed - (fieldAnalysis.field_analysis?.missing_count || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Field Completeness List */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Campos</CardTitle>
                <CardDescription>
                  Lista completa de campos com status de completude
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {completenessData && Object.entries(completenessData.completeness_report?.field_completeness || {}).map(([field, data]) => {
                    const status = getCompletenessStatus(data.completeness_percentage)
                    return (
                      <div key={field} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium capitalize">{field.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-500">
                            {data.missing_count} de {data.total_count} faltantes
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${status.color}`}>
                            {data.completeness_percentage.toFixed(1)}%
                          </div>
                          <Badge variant={data.completeness_percentage >= 80 ? "secondary" : "destructive"}>
                            {status.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Padrões de Dados Faltantes
              </CardTitle>
              <CardDescription>
                Análise de padrões identificados nos dados faltantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completenessData?.completeness_report?.missing_patterns?.length > 0 ? (
                <div className="space-y-4">
                  {completenessData.completeness_report.missing_patterns.map((pattern, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Padrão {index + 1}</h4>
                        <Badge variant="outline">
                          {pattern.frequency} ocorrências
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Campos afetados:</strong> {pattern.fields?.join(', ') || 'N/A'}</p>
                        <p><strong>Percentual:</strong> {pattern.percentage?.toFixed(1) || 0}% dos registros</p>
                        <p><strong>Tipo:</strong> {pattern.pattern_type || 'Desconhecido'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum padrão de dados faltantes identificado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imputation" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Análise de Imputação</h3>
            <Button onClick={runImputationAnalysis} disabled={loading}>
              <Zap className="h-4 w-4 mr-2" />
              Executar Análise
            </Button>
          </div>

          {imputationData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recomendações de Imputação</CardTitle>
                  <CardDescription>
                    Estratégias recomendadas para campos com dados faltantes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {imputationData.recommendations?.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{rec.field}</p>
                          <p className="text-sm text-gray-600">
                            <strong>Método:</strong> {rec.recommended_method} |
                            <strong>Confiança:</strong> {(rec.confidence_score * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )) || []}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance de Imputação</CardTitle>
                  <CardDescription>
                    Métricas de performance dos métodos de imputação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {imputationData.performance_summary && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {imputationData.performance_summary.total_imputations || 0}
                          </div>
                          <div className="text-sm text-gray-600">Total de Imputações</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {imputationData.performance_summary.avg_confidence?.toFixed(1) || 0}%
                          </div>
                          <div className="text-sm text-gray-600">Confiança Média</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Métodos Utilizados</h4>
                        <div className="flex flex-wrap gap-2">
                          {imputationData.performance_summary.methods_used?.map((method, index) => (
                            <Badge key={index} variant="outline">{method}</Badge>
                          )) || []}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Análise de Imputação</h3>
                <p className="text-gray-500 text-center mb-4">
                  Execute a análise para ver recomendações de imputação e métricas de performance.
                </p>
                <Button onClick={runImputationAnalysis} disabled={loading}>
                  <Zap className="h-4 w-4 mr-2" />
                  Executar Análise de Imputação
                </Button>
              </CardContent>
            </Card>
          )}
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

export default DataCompletenessAnalyzer