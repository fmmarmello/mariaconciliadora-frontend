import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Database,
  Target,
  Zap,
  RefreshCw,
  Download
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
  Cell,
  Area,
  AreaChart
} from 'recharts'
import API_CONFIG from '@/config/api.js'

const DataQualityDashboard = () => {
  const [qualityMetrics, setQualityMetrics] = useState(null)
  const [completenessData, setCompletenessData] = useState(null)
  const [validationStats, setValidationStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0']

  useEffect(() => {
    fetchQualityData()
  }, [selectedPeriod])

  const fetchQualityData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch quality metrics
      const qualityResponse = await fetch(API_CONFIG.getApiUrl(`api/data-quality/quality/metrics?days=${selectedPeriod}`))
      const qualityData = await qualityResponse.json()

      if (qualityData.success) {
        setQualityMetrics(qualityData.data)
      }

      // Fetch completeness analysis
      const completenessResponse = await fetch(API_CONFIG.getApiUrl('api/data-quality/completeness/analysis'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_source: 'database',
          table_name: 'transactions',
          filters: { date_range: `last_${selectedPeriod}_days` }
        })
      })
      const completenessData = await completenessResponse.json()

      if (completenessData.success) {
        setCompletenessData(completenessData.data)
      }

      // Fetch validation stats
      const validationResponse = await fetch(API_CONFIG.getApiUrl('api/validation/report/validation-stats'))
      const validationData = await validationResponse.json()

      if (validationData.success) {
        setValidationStats(validationData.data)
      }

    } catch (err) {
      setError('Erro ao carregar dados de qualidade')
      console.error('Error fetching quality data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchQualityData()
    setRefreshing(false)
  }

  const exportQualityReport = () => {
    // Implement export functionality
    const reportData = {
      qualityMetrics,
      completenessData,
      validationStats,
      generatedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `data-quality-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard de Qualidade de Dados</h2>
            <p className="text-gray-600">Monitoramento abrangente da qualidade dos dados</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Qualidade de Dados</h2>
          <p className="text-gray-600">Monitoramento abrangente da qualidade dos dados</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
              <SelectItem value="365">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={exportQualityReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Quality Overview Cards */}
      {qualityMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score de Qualidade Geral</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(qualityMetrics.quality_score * 100).toFixed(1)}%
              </div>
              <Progress value={qualityMetrics.quality_score * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {qualityMetrics.quality_score > 0.8 ? 'Excelente' :
                 qualityMetrics.quality_score > 0.6 ? 'Bom' :
                 qualityMetrics.quality_score > 0.4 ? 'Regular' : 'Precisa de atenção'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registros Analisados</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{qualityMetrics.total_records.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Período: últimos {selectedPeriod} dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Validação</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {validationStats ? '98.5%' : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Validações bem-sucedidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">3</div>
              <p className="text-xs text-muted-foreground">
                Requer atenção
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="completeness" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="completeness">Completude</TabsTrigger>
          <TabsTrigger value="validation">Validação</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="completeness" className="space-y-4">
          {completenessData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Completude por Campo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(completenessData.completeness_report.field_completeness || {}).map(([field, data]) => ({
                        field: field.charAt(0).toUpperCase() + field.slice(1),
                        completeness: data.completeness_percentage,
                        missing: data.missing_count
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="field" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Completude']} />
                      <Bar dataKey="completeness" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Distribuição de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Completos', value: completenessData.completeness_report.dataset_completeness * 100, fill: '#10b981' },
                          { name: 'Incompletos', value: (1 - completenessData.completeness_report.dataset_completeness) * 100, fill: '#ef4444' }
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

        <TabsContent value="validation" className="space-y-4">
          {validationStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(validationStats.validation_stats || {}).map(([engine, stats]) => (
                <Card key={engine}>
                  <CardHeader>
                    <CardTitle className="text-sm capitalize">
                      {engine.replace('_', ' ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Regras Totais:</span>
                        <span className="font-medium">{stats.total_rules || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Regras Ativas:</span>
                        <span className="font-medium">{stats.enabled_rules || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Grupos:</span>
                        <span className="font-medium">{stats.total_groups || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Tendências de Qualidade
              </CardTitle>
              <CardDescription>
                Evolução da qualidade dos dados ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={[
                    { date: '2024-01', quality: 85, completeness: 88, validation: 92 },
                    { date: '2024-02', quality: 87, completeness: 90, validation: 94 },
                    { date: '2024-03', quality: 89, completeness: 92, validation: 95 },
                    { date: '2024-04', quality: 91, completeness: 94, validation: 96 },
                    { date: '2024-05', quality: 88, completeness: 91, validation: 93 },
                    { date: '2024-06', quality: 92, completeness: 95, validation: 97 }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="quality" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="completeness" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="validation" stackId="1" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Imputação Automática</p>
                      <p className="text-sm text-gray-600">Aplicar estratégias de imputação para campos críticos</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Validação de Regras</p>
                      <p className="text-sm text-gray-600">Revisar regras de validação para reduzir falsos positivos</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Activity className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Monitoramento Contínuo</p>
                      <p className="text-sm text-gray-600">Configurar alertas para quedas na qualidade</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Métricas de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Velocidade de Processamento</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Precisão de Detecção</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cobertura de Validação</span>
                      <span>88%</span>
                    </div>
                    <Progress value={88} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DataQualityDashboard