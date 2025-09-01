import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import {
  BarChart3,
  TrendingUp,
  RefreshCw,
  Play,
  Settings,
  Target,
  Zap,
  Eye,
  Download,
  Cpu,
  Activity
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts'
import API_CONFIG from '@/config/api.js'

const FeatureEngineeringMetrics = () => {
  const [featureData, setFeatureData] = useState(null)
  const [qualityMetrics, setQualityMetrics] = useState(null)
  const [performanceData, setPerformanceData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedFeatureType, setSelectedFeatureType] = useState('text')
  const [activeTab, setActiveTab] = useState('overview')

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0']

  useEffect(() => {
    fetchFeatureData()
  }, [selectedFeatureType])

  const fetchFeatureData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate feature engineering API calls
      // In production, these would call actual endpoints
      setFeatureData({
        features: [
          { name: 'text_length', importance: 0.85, quality: 0.92, type: 'text' },
          { name: 'amount_normalized', importance: 0.78, quality: 0.89, type: 'numerical' },
          { name: 'temporal_features', importance: 0.72, quality: 0.94, type: 'temporal' },
          { name: 'category_encoded', importance: 0.65, quality: 0.87, type: 'categorical' },
          { name: 'financial_ratios', importance: 0.58, quality: 0.91, type: 'financial' }
        ],
        total_features: 24,
        processing_time: 1250,
        quality_score: 0.88
      })

      setQualityMetrics({
        overall_quality: 0.88,
        feature_coverage: 0.92,
        correlation_score: 0.15,
        redundancy_score: 0.08
      })

      setPerformanceData({
        training_time: 1250,
        memory_usage: 450,
        feature_processing_time: 320,
        model_accuracy: 0.94
      })

    } catch (err) {
      setError('Erro ao carregar dados de feature engineering')
      console.error('Error fetching feature data:', err)
    } finally {
      setLoading(false)
    }
  }

  const runFeatureEngineering = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate feature engineering process
      await new Promise(resolve => setTimeout(resolve, 2000))

      setFeatureData(prev => ({
        ...prev,
        features: prev.features.map(f => ({
          ...f,
          importance: f.importance + (Math.random() - 0.5) * 0.1,
          quality: Math.min(1, f.quality + (Math.random() - 0.5) * 0.05)
        }))
      }))

    } catch (err) {
      setError('Erro no processamento de features')
      console.error('Error running feature engineering:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportFeatureReport = () => {
    const reportData = {
      featureData,
      qualityMetrics,
      performanceData,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `feature-engineering-report-${new Date().toISOString().split('T')[0]}.json`
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
          <h2 className="text-2xl font-bold text-gray-900">Métricas de Feature Engineering</h2>
          <p className="text-gray-600">Análise de qualidade e performance das features extraídas</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedFeatureType} onValueChange={setSelectedFeatureType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="numerical">Numérico</SelectItem>
              <SelectItem value="temporal">Temporal</SelectItem>
              <SelectItem value="categorical">Categórico</SelectItem>
              <SelectItem value="financial">Financeiro</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportFeatureReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={fetchFeatureData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Features</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {featureData?.total_features || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualidade Geral</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((qualityMetrics?.overall_quality || 0) * 100).toFixed(1)}%
            </div>
            <Progress value={(qualityMetrics?.overall_quality || 0) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Processamento</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {featureData?.processing_time || 0}ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acurácia do Modelo</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((performanceData?.model_accuracy || 0) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration and Execution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuração do Feature Engineering
          </CardTitle>
          <CardDescription>
            Configure e execute o processo de extração de features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Tipo selecionado: <span className="font-medium capitalize">{selectedFeatureType}</span>
            </div>
            <Button onClick={runFeatureEngineering} disabled={loading}>
              <Play className="h-4 w-4 mr-2" />
              {loading ? 'Processando...' : 'Executar Feature Engineering'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="importance">Importância</TabsTrigger>
          <TabsTrigger value="quality">Qualidade</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {featureData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Distribuição de Features por Tipo
                  </CardTitle>
                  <CardDescription>
                    Quantidade de features por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { type: 'Texto', count: 8, quality: 0.89 },
                        { type: 'Numérico', count: 6, quality: 0.92 },
                        { type: 'Temporal', count: 5, quality: 0.94 },
                        { type: 'Categórico', count: 3, quality: 0.87 },
                        { type: 'Financeiro', count: 2, quality: 0.91 }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Top Features
                  </CardTitle>
                  <CardDescription>
                    Features mais importantes e suas métricas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {featureData.features?.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{feature.name.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-500 capitalize">{feature.type}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {(feature.importance * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">importância</div>
                        </div>
                      </div>
                    )) || []}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Cpu className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Execute o Feature Engineering</h3>
                <p className="text-gray-500 text-center mb-4">
                  Configure os parâmetros acima e execute o processo de extração de features.
                </p>
                <Button onClick={runFeatureEngineering} disabled={loading}>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Processamento
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="importance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Importância das Features</CardTitle>
              <CardDescription>
                Features ordenadas por importância para o modelo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={featureData?.features?.sort((a, b) => b.importance - a.importance) || []}
                  layout="horizontal"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 1]} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Importância']} />
                  <Bar dataKey="importance" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Qualidade</CardTitle>
                <CardDescription>
                  Avaliação da qualidade das features extraídas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Qualidade Geral</span>
                      <span>{((qualityMetrics?.overall_quality || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(qualityMetrics?.overall_quality || 0) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cobertura de Features</span>
                      <span>{((qualityMetrics?.feature_coverage || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(qualityMetrics?.feature_coverage || 0) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Correlação</span>
                      <span>{((qualityMetrics?.correlation_score || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(qualityMetrics?.correlation_score || 0) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Redundância</span>
                      <span>{((qualityMetrics?.redundancy_score || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(qualityMetrics?.redundancy_score || 0) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qualidade por Tipo de Feature</CardTitle>
                <CardDescription>
                  Distribuição da qualidade por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Texto', value: 89, fill: '#8884d8' },
                        { name: 'Numérico', value: 92, fill: '#82ca9d' },
                        { name: 'Temporal', value: 94, fill: '#ffc658' },
                        { name: 'Categórico', value: 87, fill: '#ff7300' },
                        { name: 'Financeiro', value: 91, fill: '#8dd1e1' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    />
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
                <CardDescription>
                  Performance do processo de feature engineering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {performanceData?.training_time || 0}
                      </div>
                      <div className="text-sm text-gray-600">ms</div>
                      <div className="text-xs text-blue-600">Tempo Total</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {performanceData?.memory_usage || 0}
                      </div>
                      <div className="text-sm text-gray-600">MB</div>
                      <div className="text-xs text-green-600">Memória</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Tempos por Etapa</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Processamento de Features:</span>
                        <span className="font-medium">{performanceData?.feature_processing_time || 0}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Treinamento do Modelo:</span>
                        <span className="font-medium">{performanceData?.training_time || 0}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avaliação:</span>
                        <span className="font-medium">150ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Correlação Features vs Performance</CardTitle>
                <CardDescription>
                  Relação entre qualidade das features e performance do modelo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart
                    data={featureData?.features?.map((f) => ({
                      x: f.quality * 100,
                      y: f.importance * 100,
                      name: f.name
                    })) || []}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" name="Qualidade (%)" />
                    <YAxis dataKey="y" name="Importância (%)" />
                    <Tooltip formatter={(value, name) => [`${value.toFixed(1)}%`, name]} />
                    <Scatter name="Features" dataKey="y" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default FeatureEngineeringMetrics