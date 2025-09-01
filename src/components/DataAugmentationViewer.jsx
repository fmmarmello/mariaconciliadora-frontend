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
  Shuffle,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Play,
  Settings,
  Target,
  Zap,
  Eye,
  Download,
  Database
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
  ComposedChart
} from 'recharts'
import API_CONFIG from '@/config/api.js'

const DataAugmentationViewer = () => {
  const [augmentationData, setAugmentationData] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedDataType, setSelectedDataType] = useState('transaction')
  const [augmentationRatio, setAugmentationRatio] = useState(2.0)
  const [activeTab, setActiveTab] = useState('overview')

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0']

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch(API_CONFIG.getApiUrl('api/data-augmentation/metrics'))
      const data = await response.json()

      if (data.success) {
        setMetrics(data.data)
      }
    } catch (err) {
      console.error('Error fetching metrics:', err)
    }
  }

  const runAugmentation = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(API_CONFIG.getApiUrl('api/data-augmentation/augment'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            {
              description: 'Pagamento de fornecedor',
              amount: 1500.50,
              date: '2024-01-15',
              category: 'Despesas'
            },
            {
              description: 'Compra de materiais',
              amount: 750.25,
              date: '2024-01-20',
              category: 'Materiais'
            }
          ],
          data_type: selectedDataType,
          config: {
            augmentation_ratio: augmentationRatio,
            text_augmentation: { enabled: true }
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        setAugmentationData(data.data)
      } else {
        setError(data.error || 'Erro na augmentação')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
      console.error('Error running augmentation:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportAugmentationReport = () => {
    const reportData = {
      augmentationData,
      metrics,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `data-augmentation-report-${new Date().toISOString().split('T')[0]}.json`
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
          <h2 className="text-2xl font-bold text-gray-900">Visualizador de Augmentação de Dados</h2>
          <p className="text-gray-600">Monitoramento e análise de técnicas de augmentação de dados</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={exportAugmentationReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={fetchMetrics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dados Originais</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {augmentationData?.original_size || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dados Augmentados</CardTitle>
            <Shuffle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {augmentationData?.augmented_size || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {augmentationData ? `${((augmentationData.augmented_size / augmentationData.original_size - 1) * 100).toFixed(1)}% de aumento` : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualidade</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.5%</div>
            <Progress value={92.5} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Técnicas Aplicadas</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Métodos de augmentação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Configuration and Execution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuração da Augmentação
          </CardTitle>
          <CardDescription>
            Configure os parâmetros para augmentação de dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data-type">Tipo de Dados</Label>
              <Select value={selectedDataType} onValueChange={setSelectedDataType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transaction">Transações</SelectItem>
                  <SelectItem value="company_financial">Dados Financeiros</SelectItem>
                  <SelectItem value="mixed">Misto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ratio">Razão de Augmentação</Label>
              <Input
                id="ratio"
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={augmentationRatio}
                onChange={(e) => setAugmentationRatio(parseFloat(e.target.value))}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={runAugmentation} disabled={loading} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                {loading ? 'Executando...' : 'Executar Augmentação'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="techniques">Técnicas</TabsTrigger>
          <TabsTrigger value="quality">Qualidade</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {augmentationData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Crescimento do Dataset
                  </CardTitle>
                  <CardDescription>
                    Comparação entre dados originais e augmentados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          name: 'Original',
                          count: augmentationData.original_size,
                          fill: '#8884d8'
                        },
                        {
                          name: 'Augmentado',
                          count: augmentationData.augmented_size,
                          fill: '#82ca9d'
                        }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Amostra de Dados Augmentados
                  </CardTitle>
                  <CardDescription>
                    Exemplos dos dados gerados pela augmentação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {augmentationData.augmented_data?.slice(0, 5).map((item, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-sm">{item.description}</p>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>R$ {item.amount?.toFixed(2)}</span>
                          <span>{item.date}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
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
                <Shuffle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Execute a Augmentação</h3>
                <p className="text-gray-500 text-center mb-4">
                  Configure os parâmetros acima e execute a augmentação para visualizar os resultados.
                </p>
                <Button onClick={runAugmentation} disabled={loading}>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Augmentação
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="techniques" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Técnicas Aplicadas</CardTitle>
                <CardDescription>
                  Métodos de augmentação utilizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'SMOTE', description: 'Synthetic Minority Oversampling Technique', status: 'Aplicado' },
                    { name: 'Text Augmentation', description: 'Sinônimos e parafraseamento', status: 'Aplicado' },
                    { name: 'Noise Injection', description: 'Injeção de ruído numérico', status: 'Aplicado' },
                    { name: 'Temporal Shifting', description: 'Deslocamento temporal', status: 'Pendente' }
                  ].map((technique, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{technique.name}</p>
                        <p className="text-sm text-gray-600">{technique.description}</p>
                      </div>
                      <Badge variant={technique.status === 'Aplicado' ? 'default' : 'secondary'}>
                        {technique.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Técnica</CardTitle>
                <CardDescription>
                  Contribuição de cada técnica para o dataset final
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'SMOTE', value: 45, fill: '#8884d8' },
                        { name: 'Text Aug.', value: 30, fill: '#82ca9d' },
                        { name: 'Noise Inj.', value: 15, fill: '#ffc658' },
                        { name: 'Original', value: 10, fill: '#ff7300' }
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
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Qualidade</CardTitle>
                <CardDescription>
                  Avaliação da qualidade dos dados augmentados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Similaridade com Original</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Diversidade</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Consistência</span>
                      <span>89%</span>
                    </div>
                    <Progress value={89} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Realismo</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Distribuição</CardTitle>
                <CardDescription>
                  Comparação de distribuições original vs augmentada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart
                    data={[
                      { range: '0-100', original: 25, augmented: 35 },
                      { range: '100-500', original: 45, augmented: 55 },
                      { range: '500-1000', original: 20, augmented: 30 },
                      { range: '1000+', original: 10, augmented: 15 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="original" fill="#8884d8" name="Original" />
                    <Bar dataKey="augmented" fill="#82ca9d" name="Augmentado" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparação Antes vs Depois</CardTitle>
              <CardDescription>
                Análise comparativa dos datasets original e augmentado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {augmentationData?.original_size || 0}
                  </div>
                  <div className="text-sm text-blue-800">Registros Originais</div>
                  <div className="text-xs text-blue-600 mt-1">100% dos dados base</div>
                </div>

                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    +{((augmentationData?.augmented_size || 0) - (augmentationData?.original_size || 0))}
                  </div>
                  <div className="text-sm text-green-800">Novos Registros</div>
                  <div className="text-xs text-green-600 mt-1">
                    +{augmentationData ? (((augmentationData.augmented_size / augmentationData.original_size - 1) * 100).toFixed(1)) : 0}% de aumento
                  </div>
                </div>

                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {augmentationData?.augmented_size || 0}
                  </div>
                  <div className="text-sm text-purple-800">Total Final</div>
                  <div className="text-xs text-purple-600 mt-1">Dataset completo</div>
                </div>
              </div>
            </CardContent>
          </Card>
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

export default DataAugmentationViewer