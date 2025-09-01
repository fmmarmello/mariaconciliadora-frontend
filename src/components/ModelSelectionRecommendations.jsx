import { useState, useEffect } from 'react'
import { post, ApiError } from '@/services/apiService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import {
  Lightbulb,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Target,
  Zap,
  BarChart3,
  Clock,
  Cpu,
  Star
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

const ModelSelectionRecommendations = () => {
  const [dataSource, setDataSource] = useState('transactions')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [useCase, setUseCase] = useState('classification')
  const [priority, setPriority] = useState('accuracy')
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('recommendations')

  // Mock recommendations data
  const mockRecommendations = {
    best_model: 'xgboost',
    confidence_level: 'high',
    reasoning: 'Melhor equilíbrio entre performance e eficiência computacional',
    alternative_models: [
      {
        name: 'lightgbm',
        score: 0.92,
        advantages: ['Mais rápido', 'Menos memória'],
        disadvantages: ['Menos preciso'],
        use_case: 'Produção com recursos limitados'
      },
      {
        name: 'random_forest',
        score: 0.89,
        advantages: ['Interpretável', 'Robusto'],
        disadvantages: ['Mais lento', 'Mais memória'],
        use_case: 'Análise explicável'
      },
      {
        name: 'bert',
        score: 0.95,
        advantages: ['Mais preciso', 'Excelente com texto'],
        disadvantages: ['Muito lento', 'Muito memória'],
        use_case: 'Máxima precisão (offline)'
      }
    ],
    data_analysis: {
      n_samples: 1250,
      n_features: 45,
      class_distribution: 'balanced',
      text_features: true,
      numeric_features: true,
      categorical_features: true,
      temporal_features: true,
      complexity_score: 0.75
    },
    model_comparison: [
      {
        model: 'XGBoost',
        accuracy: 0.91,
        precision: 0.89,
        recall: 0.93,
        f1_score: 0.91,
        training_time: 45,
        inference_time: 2,
        memory_usage: 150
      },
      {
        model: 'LightGBM',
        accuracy: 0.89,
        precision: 0.87,
        recall: 0.91,
        f1_score: 0.89,
        training_time: 32,
        inference_time: 1.5,
        memory_usage: 120
      },
      {
        model: 'Random Forest',
        accuracy: 0.87,
        precision: 0.85,
        recall: 0.89,
        f1_score: 0.87,
        training_time: 65,
        inference_time: 3,
        memory_usage: 200
      },
      {
        model: 'BERT',
        accuracy: 0.94,
        precision: 0.92,
        recall: 0.96,
        f1_score: 0.94,
        training_time: 240,
        inference_time: 15,
        memory_usage: 800
      }
    ],
    recommendations: [
      {
        type: 'performance',
        title: 'Otimização de Performance',
        description: 'XGBoost oferece o melhor equilíbrio entre precisão e velocidade',
        priority: 'high'
      },
      {
        type: 'resources',
        title: 'Considerações de Recursos',
        description: 'Para produção, considere LightGBM para menor uso de memória',
        priority: 'medium'
      },
      {
        type: 'interpretability',
        title: 'Interpretabilidade',
        description: 'Random Forest oferece melhor interpretabilidade das decisões',
        priority: 'low'
      },
      {
        type: 'scalability',
        title: 'Escalabilidade',
        description: 'BERT pode ser otimizado para inferência mais rápida em produção',
        priority: 'medium'
      }
    ]
  }

  const getRecommendations = async () => {
    setLoading(true)
    setError(null)

    try {
      // In production, this would call the actual API
      // const data = await post('api/models/advanced-select', {
      //   data_source: dataSource,
      //   start_date: startDate || undefined,
      //   end_date: endDate || undefined,
      //   use_case: useCase,
      //   priority: priority
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setRecommendations(mockRecommendations)
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError('Erro ao obter recomendações de modelo')
      }
    } finally {
      setLoading(false)
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <Star className="h-4 w-4 text-red-500" />
      case 'medium':
        return <Star className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <Star className="h-4 w-4 text-gray-400" />
      default:
        return <Star className="h-4 w-4 text-gray-300" />
    }
  }

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Recomendações de Seleção de Modelo
          </CardTitle>
          <CardDescription>
            Obtenha recomendações inteligentes para escolher o melhor modelo ML
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data-source">Fonte de Dados</Label>
              <Select value={dataSource} onValueChange={setDataSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transactions">Transações</SelectItem>
                  <SelectItem value="company_financial">Dados Financeiros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="use-case">Caso de Uso</Label>
              <Select value={useCase} onValueChange={setUseCase}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classification">Classificação</SelectItem>
                  <SelectItem value="regression">Regressão</SelectItem>
                  <SelectItem value="clustering">Clustering</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accuracy">Precisão Máxima</SelectItem>
                  <SelectItem value="speed">Velocidade</SelectItem>
                  <SelectItem value="memory">Uso de Memória</SelectItem>
                  <SelectItem value="balanced">Equilibrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Data Inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">Data Final</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={getRecommendations} disabled={loading} size="lg">
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analisando Dados...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Obter Recomendações
                </>
              )}
            </Button>
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
            <span>Analisando características dos dados e gerando recomendações...</span>
          </CardContent>
        </Card>
      )}

      {recommendations && !loading && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
            <TabsTrigger value="comparison">Comparação</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            {/* Best Model Recommendation */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Modelo Recomendado: {recommendations.best_model.toUpperCase()}
                </CardTitle>
                <CardDescription className="text-green-700">
                  {recommendations.reasoning}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Badge className={getConfidenceColor(recommendations.confidence_level)}>
                    Confiança: {recommendations.confidence_level.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    Prioridade: {priority}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">
                      {(recommendations.model_comparison.find(m => m.model.toLowerCase() === recommendations.best_model)?.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Acurácia</div>
                  </div>

                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">
                      {recommendations.model_comparison.find(m => m.model.toLowerCase() === recommendations.best_model)?.training_time}s
                    </div>
                    <div className="text-sm text-gray-600">Tempo de Treino</div>
                  </div>

                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-purple-600">
                      {recommendations.model_comparison.find(m => m.model.toLowerCase() === recommendations.best_model)?.memory_usage}MB
                    </div>
                    <div className="text-sm text-gray-600">Uso de Memória</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alternative Models */}
            <Card>
              <CardHeader>
                <CardTitle>Modelos Alternativos</CardTitle>
                <CardDescription>
                  Outras opções com diferentes pontos fortes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.alternative_models.map((model, index) => (
                    <div key={model.name} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{model.name.toUpperCase()}</h4>
                            <Badge variant="outline">
                              Score: {(model.score * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{model.use_case}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-green-700 mb-1">Vantagens</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {model.advantages.map((advantage, idx) => (
                              <li key={idx} className="flex items-center">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                {advantage}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-red-700 mb-1">Desvantagens</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {model.disadvantages.map((disadvantage, idx) => (
                              <li key={idx} className="flex items-center">
                                <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                                {disadvantage}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            {/* Model Comparison Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Matriz de Comparação</CardTitle>
                <CardDescription>
                  Comparação detalhada de performance e recursos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Modelo</th>
                        <th className="text-center p-2">Acurácia</th>
                        <th className="text-center p-2">Precisão</th>
                        <th className="text-center p-2">Recall</th>
                        <th className="text-center p-2">F1-Score</th>
                        <th className="text-center p-2">Tempo Treino</th>
                        <th className="text-center p-2">Inferência</th>
                        <th className="text-center p-2">Memória</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recommendations.model_comparison.map((model) => (
                        <tr key={model.model} className="border-b">
                          <td className="p-2 font-medium">{model.model}</td>
                          <td className="p-2 text-center">{(model.accuracy * 100).toFixed(1)}%</td>
                          <td className="p-2 text-center">{(model.precision * 100).toFixed(1)}%</td>
                          <td className="p-2 text-center">{(model.recall * 100).toFixed(1)}%</td>
                          <td className="p-2 text-center font-bold">{(model.f1_score * 100).toFixed(1)}%</td>
                          <td className="p-2 text-center">{model.training_time}s</td>
                          <td className="p-2 text-center">{model.inference_time}s</td>
                          <td className="p-2 text-center">{model.memory_usage}MB</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Performance vs Resources Scatter */}
            <Card>
              <CardHeader>
                <CardTitle>Performance vs Recursos</CardTitle>
                <CardDescription>
                  Relação entre acurácia e eficiência de recursos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={recommendations.model_comparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="accuracy" fill="#3b82f6" name="Acurácia" />
                    <Bar yAxisId="right" dataKey="training_time" fill="#ef4444" name="Tempo (s)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {/* Data Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Análise dos Dados</CardTitle>
                <CardDescription>
                  Características dos dados que influenciaram as recomendações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {recommendations.data_analysis.n_samples.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Amostras</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {recommendations.data_analysis.n_features}
                    </div>
                    <div className="text-sm text-gray-600">Features</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(recommendations.data_analysis.complexity_score * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Complexidade</div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {recommendations.data_analysis.class_distribution}
                    </div>
                    <div className="text-sm text-gray-600">Distribuição</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Características dos Dados</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {recommendations.data_analysis.text_features && (
                      <Badge variant="outline" className="justify-center">Texto</Badge>
                    )}
                    {recommendations.data_analysis.numeric_features && (
                      <Badge variant="outline" className="justify-center">Numérico</Badge>
                    )}
                    {recommendations.data_analysis.categorical_features && (
                      <Badge variant="outline" className="justify-center">Categórico</Badge>
                    )}
                    {recommendations.data_analysis.temporal_features && (
                      <Badge variant="outline" className="justify-center">Temporal</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Recommendations List */}
            <Card>
              <CardHeader>
                <CardTitle>Recomendações Específicas</CardTitle>
                <CardDescription>
                  Sugestões baseadas na análise completa dos dados e modelos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {getPriorityIcon(rec.priority)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{rec.title}</h4>
                            <Badge className={
                              rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{rec.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Decision Helper */}
            <Card>
              <CardHeader>
                <CardTitle>Ajuda na Decisão</CardTitle>
                <CardDescription>
                  Guia para escolher o modelo certo baseado em suas necessidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Para Produção</h4>
                    <p className="text-blue-700 text-sm">
                      Se velocidade e eficiência são prioridades, considere LightGBM.
                      Oferece bom equilíbrio entre performance e recursos computacionais.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Para Análise Exploratória</h4>
                    <p className="text-green-700 text-sm">
                      Se interpretabilidade é importante, Random Forest oferece
                      melhor compreensão das decisões do modelo.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">Para Máxima Precisão</h4>
                    <p className="text-purple-700 text-sm">
                      Quando precisão é crítica e recursos não são limitantes,
                      BERT oferece a melhor performance possível.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!recommendations && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lightbulb className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Configure os Parâmetros
            </h3>
            <p className="text-gray-500 text-center">
              Ajuste as configurações acima para obter recomendações personalizadas de modelo
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ModelSelectionRecommendations