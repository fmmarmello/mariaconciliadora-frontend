import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Clock,
  Target,
  Zap
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts'
import API_CONFIG from '@/config/api.js'

const ValidationResultsViewer = () => {
  const [validationResults, setValidationResults] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [commonIssues, setCommonIssues] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProfile, setSelectedProfile] = useState('transaction')
  const [testData, setTestData] = useState({
    description: 'Pagamento de fornecedor para compra de materiais de escritório',
    amount: 2500.50,
    date: '2024-01-15',
    bank_name: 'Itaú',
    category: 'Despesas Administrativas'
  })
  const [validationHistory, setValidationHistory] = useState([])
  const [showDetails, setShowDetails] = useState(false)

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6']

  useEffect(() => {
    fetchValidationData()
  }, [])

  const fetchValidationData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch dashboard data
      const dashboardResponse = await fetch(API_CONFIG.getApiUrl('api/validation/reports/dashboard'))
      const dashboardData = await dashboardResponse.json()

      if (dashboardData.success) {
        setDashboardData(dashboardData.data)
      }

      // Fetch common issues
      const issuesResponse = await fetch(API_CONFIG.getApiUrl('api/validation/analytics/issues'))
      const issuesData = await issuesResponse.json()

      if (issuesData.success) {
        setCommonIssues(issuesData.data)
      }

    } catch (err) {
      setError('Erro ao carregar dados de validação')
      console.error('Error fetching validation data:', err)
    } finally {
      setLoading(false)
    }
  }

  const runValidation = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(API_CONFIG.getApiUrl('api/validation/validate/transaction'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: testData,
          profile: selectedProfile,
          context: { source: 'frontend_test' }
        })
      })

      const result = await response.json()

      if (result.success) {
        setValidationResults(result.data)
        setValidationHistory(prev => [{
          timestamp: new Date().toISOString(),
          profile: selectedProfile,
          result: result.data,
          testData: { ...testData }
        }, ...prev.slice(0, 9)]) // Keep last 10 results
      } else {
        setError(result.error || 'Erro na validação')
      }

    } catch (err) {
      setError('Erro de conexão com o servidor')
      console.error('Error running validation:', err)
    } finally {
      setLoading(false)
    }
  }


  const getValidationSummary = (result) => {
    if (!result) return null

    const errors = result.errors?.length || 0
    const warnings = result.warnings?.length || 0
    const total = errors + warnings

    return {
      total,
      errors,
      warnings,
      isValid: result.is_valid,
      duration: result.validation_duration_ms
    }
  }

  if (loading && !validationResults) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Visualizador de Resultados de Validação</h2>
            <p className="text-gray-600">Análise detalhada dos resultados de validação em tempo real</p>
          </div>
        </div>

        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const summary = getValidationSummary(validationResults)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visualizador de Resultados de Validação</h2>
          <p className="text-gray-600">Análise detalhada dos resultados de validação em tempo real</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchValidationData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setShowDetails(!showDetails)} variant="outline">
            {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showDetails ? 'Ocultar' : 'Mostrar'} Detalhes
          </Button>
        </div>
      </div>

      {/* Test Validation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Teste de Validação
          </CardTitle>
          <CardDescription>
            Execute validação em tempo real com dados de teste
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile">Perfil de Validação</Label>
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transaction">Transação</SelectItem>
                  <SelectItem value="company_financial">Dados Financeiros</SelectItem>
                  <SelectItem value="api_data">Dados de API</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={testData.description}
                onChange={(e) => setTestData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da transação"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={testData.amount}
                onChange={(e) => setTestData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={testData.date}
                onChange={(e) => setTestData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank">Banco</Label>
              <Input
                id="bank"
                value={testData.bank_name}
                onChange={(e) => setTestData(prev => ({ ...prev, bank_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={testData.category}
                onChange={(e) => setTestData(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
          </div>

          <Button onClick={runValidation} disabled={loading} className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            {loading ? 'Executando Validação...' : 'Executar Validação'}
          </Button>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResults && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Cards */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status da Validação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {summary.isValid ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">
                      {summary.isValid ? 'Válido' : 'Inválido'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {summary.total} problema{summary.total !== 1 ? 's' : ''} encontrado{summary.total !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Erros</span>
                  <Badge variant="destructive">{summary.errors}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avisos</span>
                  <Badge variant="secondary">{summary.warnings}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tempo</span>
                  <span className="text-sm font-medium">{summary.duration?.toFixed(2)}ms</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Engines Utilizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validationResults.engines_used?.map((engine, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm capitalize">
                        {engine.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resultados Detalhados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Errors */}
                {validationResults.errors?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Erros ({validationResults.errors.length})</h4>
                    <div className="space-y-2">
                      {validationResults.errors.map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {validationResults.warnings?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-700 mb-2">Avisos ({validationResults.warnings.length})</h4>
                    <div className="space-y-2">
                      {validationResults.warnings.map((warning, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{warning}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {showDetails && validationResults.metadata && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Metadados Técnicos</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(validationResults.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Validation History */}
      {validationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Histórico de Validações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validationHistory.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {item.result.is_valid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium capitalize">{item.profile}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(item.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Descrição:</strong> {item.testData.description}</p>
                    <p><strong>Valor:</strong> R$ {item.testData.amount.toFixed(2)}</p>
                    <p><strong>Erros:</strong> {item.result.errors?.length || 0}, <strong>Avisos:</strong> {item.result.warnings?.length || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Analytics */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Problemas Mais Comuns</CardTitle>
            </CardHeader>
            <CardContent>
              {commonIssues?.common_errors?.length > 0 ? (
                <div className="space-y-2">
                  {commonIssues.common_errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{error.issue}</span>
                      <Badge variant="secondary">{error.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum problema comum identificado</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campos Problemáticos</CardTitle>
            </CardHeader>
            <CardContent>
              {commonIssues?.problematic_fields?.length > 0 ? (
                <div className="space-y-2">
                  {commonIssues.problematic_fields.slice(0, 5).map((field, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{field.field}</span>
                      <Badge variant="destructive">{field.error_rate}%</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum campo problemático identificado</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default ValidationResultsViewer