import { useState, useEffect } from 'react'
import { post, ApiError } from '@/services/apiService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import {
  Target,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Eye,
  Filter,
  Download
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Treemap,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

const FeatureImportanceVisualization = () => {
  const [selectedModel, setSelectedModel] = useState('')
  const [featureData, setFeatureData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [sortBy, setSortBy] = useState('importance')
  const [filterThreshold, setFilterThreshold] = useState(0.01)

  // Mock feature importance data
  const mockFeatureData = {
    model_name: 'random_forest',
    features: [
      {
        name: 'Descrição da Transação',
        importance: 0.35,
        category: 'Texto',
        description: 'Conteúdo textual da descrição da transação',
        correlation: 0.78,
        variance: 0.92
      },
      {
        name: 'Valor da Transação',
        importance: 0.28,
        category: 'Numérico',
        description: 'Valor monetário da transação',
        correlation: 0.65,
        variance: 0.85
      },
      {
        name: 'Data da Transação',
        importance: 0.15,
        category: 'Temporal',
        description: 'Data e hora da transação',
        correlation: 0.42,
        variance: 0.68
      },
      {
        name: 'Categoria Anterior',
        importance: 0.12,
        category: 'Categórico',
        description: 'Categoria previamente atribuída',
        correlation: 0.38,
        variance: 0.72
      },
      {
        name: 'Saldo da Conta',
        importance: 0.08,
        category: 'Numérico',
        description: 'Saldo disponível na conta',
        correlation: 0.25,
        variance: 0.55
      },
      {
        name: 'Tipo de Operação',
        importance: 0.02,
        category: 'Categórico',
        description: 'Débito, crédito, transferência',
        correlation: 0.12,
        variance: 0.45
      }
    ],
    summary: {
      total_features: 6,
      important_features: 4,
      text_features: 1,
      numeric_features: 2,
      categorical_features: 2,
      temporal_features: 1,
      average_importance: 0.167,
      max_importance: 0.35,
      min_importance: 0.02
    },
    feature_interactions: [
      { feature1: 'Descrição', feature2: 'Valor', correlation: 0.45 },
      { feature1: 'Valor', feature2: 'Categoria', correlation: 0.32 },
      { feature1: 'Data', feature2: 'Saldo', correlation: 0.28 }
    ]
  }

  const loadFeatureData = async () => {
    if (!selectedModel) return

    setLoading(true)
    setError(null)

    try {
      // In production, this would call the actual API
      // const data = await post(`api/models/${selectedModel}/feature-importance`)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setFeatureData(mockFeatureData)
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError('Erro ao carregar dados de importância das features')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedModel) {
      loadFeatureData()
    }
  }, [selectedModel])

  const getFilteredFeatures = () => {
    if (!featureData) return []

    return featureData.features
      .filter(feature => feature.importance >= filterThreshold)
      .sort((a, b) => {
        switch (sortBy) {
          case 'importance':
            return b.importance - a.importance
          case 'name':
            return a.name.localeCompare(b.name)
          case 'category':
            return a.category.localeCompare(b.category)
          case 'correlation':
            return b.correlation - a.correlation
          default:
            return b.importance - a.importance
        }
      })
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Texto': '#3b82f6',
      'Numérico': '#10b981',
      'Categórico': '#8b5cf6',
      'Temporal': '#f59e0b'
    }
    return colors[category] || '#6b7280'
  }

  const getImportanceLevel = (importance) => {
    if (importance >= 0.3) return { level: 'Crítica', color: 'bg-red-100 text-red-800' }
    if (importance >= 0.2) return { level: 'Alta', color: 'bg-orange-100 text-orange-800' }
    if (importance >= 0.1) return { level: 'Média', color: 'bg-yellow-100 text-yellow-800' }
    return { level: 'Baixa', color: 'bg-gray-100 text-gray-800' }
  }

  const exportFeatureReport = () => {
    const reportData = {
      model: selectedModel,
      features: getFilteredFeatures(),
      summary: featureData?.summary,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `feature-importance-${selectedModel}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Visualização da Importância das Features
          </CardTitle>
          <CardDescription>
            Analise quais características mais influenciam as previsões do modelo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Selecione o Modelo</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um modelo treinado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random_forest">Random Forest</SelectItem>
                  <SelectItem value="xgboost">XGBoost</SelectItem>
                  <SelectItem value="lightgbm">LightGBM</SelectItem>
                  <SelectItem value="bert">BERT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={loadFeatureData}
                disabled={!selectedModel || loading}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>

              <Button
                onClick={exportFeatureReport}
                disabled={!featureData}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mr-2" />
            <span>Analisando importância das features...</span>
          </CardContent>
        </Card>
      )}

      {featureData && !loading && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {featureData.summary.total_features}
                    </div>
                    <div className="text-sm text-gray-600">Total de Features</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {featureData.summary.important_features}
                    </div>
                    <div className="text-sm text-gray-600">Features Importantes</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(featureData.summary.average_importance * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Importância Média</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {(featureData.summary.max_importance * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Importância Máxima</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>
                  Como as features estão distribuídas por tipo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {featureData.summary.text_features}
                    </div>
                    <div className="text-sm text-gray-600">Texto</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {featureData.summary.numeric_features}
                    </div>
                    <div className="text-sm text-gray-600">Numérico</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {featureData.summary.categorical_features}
                    </div>
                    <div className="text-sm text-gray-600">Categórico</div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {featureData.summary.temporal_features}
                    </div>
                    <div className="text-sm text-gray-600">Temporal</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            {/* Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Ordenar por:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="importance">Importância</SelectItem>
                        <SelectItem value="name">Nome</SelectItem>
                        <SelectItem value="category">Categoria</SelectItem>
                        <SelectItem value="correlation">Correlação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Limite mínimo:</span>
                    <Select value={filterThreshold.toString()} onValueChange={(value) => setFilterThreshold(parseFloat(value))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Todas</SelectItem>
                        <SelectItem value="0.01">1%</SelectItem>
                        <SelectItem value="0.05">5%</SelectItem>
                        <SelectItem value="0.1">10%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Horizontal Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Importância das Features</CardTitle>
                <CardDescription>
                  Ranking das features por importância no modelo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={getFilteredFeatures()}
                    layout="horizontal"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Importância']} />
                    <Bar dataKey="importance" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>
                  Proporção da importância total por categoria de feature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Texto', value: featureData.features.filter(f => f.category === 'Texto').reduce((sum, f) => sum + f.importance, 0) },
                        { name: 'Numérico', value: featureData.features.filter(f => f.category === 'Numérico').reduce((sum, f) => sum + f.importance, 0) },
                        { name: 'Categórico', value: featureData.features.filter(f => f.category === 'Categórico').reduce((sum, f) => sum + f.importance, 0) },
                        { name: 'Temporal', value: featureData.features.filter(f => f.category === 'Temporal').reduce((sum, f) => sum + f.importance, 0) }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {['Texto', 'Numérico', 'Categórico', 'Temporal'].map((category, index) => (
                        <Cell key={category} fill={getCategoryColor(category)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Importância Total']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {/* Detailed Feature List */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes das Features</CardTitle>
                <CardDescription>
                  Análise detalhada de cada feature e suas características
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredFeatures().map((feature, index) => {
                    const importanceLevel = getImportanceLevel(feature.importance)
                    return (
                      <div key={feature.name} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{feature.name}</h4>
                              <Badge variant="outline" style={{ backgroundColor: getCategoryColor(feature.category) + '20', color: getCategoryColor(feature.category) }}>
                                {feature.category}
                              </Badge>
                              <Badge className={importanceLevel.color}>
                                {importanceLevel.level}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {(feature.importance * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-500">Importância</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Correlação:</span>
                            <span className="ml-2 font-medium">{(feature.correlation * 100).toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Variância:</span>
                            <span className="ml-2 font-medium">{(feature.variance * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Feature Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Insights sobre as Features</CardTitle>
                <CardDescription>
                  Análise inteligente dos padrões de importância
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Feature Mais Importante</h4>
                    <p className="text-blue-700">
                      A feature <strong>{featureData.features[0]?.name}</strong> é a mais influente,
                      contribuindo com <strong>{(featureData.features[0]?.importance * 100).toFixed(1)}%</strong>
                      para as previsões do modelo.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Padrão de Categoria</h4>
                    <p className="text-green-700">
                      Features de <strong>texto</strong> dominam a importância total,
                      sugerindo que o conteúdo das transações é crucial para a classificação.
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2">Features Subutilizadas</h4>
                    <p className="text-orange-700">
                      {featureData.features.filter(f => f.importance < 0.05).length} features têm
                      importância muito baixa e podem ser candidatas à remoção para simplificar o modelo.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">Recomendação</h4>
                    <p className="text-purple-700">
                      Foque em melhorar a qualidade das features de texto e numéricas,
                      pois elas têm o maior impacto na performance do modelo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Correlation Scatter Plot */}
            <Card>
              <CardHeader>
                <CardTitle>Correlação vs Importância</CardTitle>
                <CardDescription>
                  Relação entre correlação com target e importância no modelo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={featureData.features}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="correlation" name="Correlação" />
                    <YAxis dataKey="importance" name="Importância" />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'correlation') return [`${(value * 100).toFixed(1)}%`, 'Correlação']
                        if (name === 'importance') return [`${(value * 100).toFixed(1)}%`, 'Importância']
                        return [value, name]
                      }}
                    />
                    <Scatter dataKey="importance" fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!selectedModel && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Eye className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecione um Modelo
            </h3>
            <p className="text-gray-500 text-center">
              Escolha um modelo treinado para visualizar a importância das features
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default FeatureImportanceVisualization