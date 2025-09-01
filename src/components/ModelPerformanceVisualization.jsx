import { useState, useEffect } from 'react'
import { post, ApiError } from '@/services/apiService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye
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
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

const ModelPerformanceVisualization = () => {
  const [selectedModel, setSelectedModel] = useState('')
  const [performanceData, setPerformanceData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data for demonstration - in production this would come from API
  const mockPerformanceData = {
    model_name: 'random_forest',
    metrics: {
      accuracy: 0.87,
      precision: 0.85,
      recall: 0.89,
      f1_score: 0.87,
      auc_roc: 0.91
    },
    confusion_matrix: {
      true_positive: 450,
      false_positive: 75,
      true_negative: 380,
      false_negative: 45
    },
    class_distribution: [
      { name: 'Classe A', value: 35, count: 175 },
      { name: 'Classe B', value: 25, count: 125 },
      { name: 'Classe C', value: 20, count: 100 },
      { name: 'Classe D', value: 20, count: 100 }
    ],
    learning_curve: [
      { epoch: 1, train_accuracy: 0.65, val_accuracy: 0.62, train_loss: 1.2, val_loss: 1.3 },
      { epoch: 2, train_accuracy: 0.72, val_accuracy: 0.68, train_loss: 0.9, val_loss: 1.0 },
      { epoch: 3, train_accuracy: 0.78, val_accuracy: 0.74, train_loss: 0.7, val_loss: 0.8 },
      { epoch: 4, train_accuracy: 0.82, val_accuracy: 0.79, train_loss: 0.5, val_loss: 0.6 },
      { epoch: 5, train_accuracy: 0.87, val_accuracy: 0.83, train_loss: 0.3, val_loss: 0.4 }
    ],
    feature_importance: [
      { name: 'Descrição', importance: 0.35 },
      { name: 'Valor', importance: 0.28 },
      { name: 'Data', importance: 0.15 },
      { name: 'Categoria Anterior', importance: 0.12 },
      { name: 'Saldo', importance: 0.10 }
    ],
    cross_validation_scores: [0.85, 0.87, 0.86, 0.88, 0.84]
  }

  const loadPerformanceData = async () => {
    if (!selectedModel) return

    setLoading(true)
    setError(null)

    try {
      // In production, this would call the actual API
      // const data = await post(`api/models/${selectedModel}/evaluate`, {
      //   data_source: 'transactions'
      // })

      // For now, simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPerformanceData(mockPerformanceData)
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError('Erro ao carregar dados de performance')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedModel) {
      loadPerformanceData()
    }
  }, [selectedModel])

  const exportReport = () => {
    // In production, this would call an export API
    const reportData = {
      model: selectedModel,
      performance: performanceData,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${selectedModel}-${new Date().toISOString().split('T')[0]}.json`
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
            <TrendingUp className="h-5 w-5 mr-2" />
            Visualização de Performance do Modelo
          </CardTitle>
          <CardDescription>
            Analise detalhadamente as métricas e performance do seu modelo de ML
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="model-select">Selecione o Modelo</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um modelo para analisar" />
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
                onClick={loadPerformanceData}
                disabled={!selectedModel || loading}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>

              <Button
                onClick={exportReport}
                disabled={!performanceData}
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
            <span>Carregando dados de performance...</span>
          </CardContent>
        </Card>
      )}

      {performanceData && !loading && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="curves">Curvas</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="validation">Validação</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(performanceData.metrics.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Acurácia</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(performanceData.metrics.precision * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Precisão</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(performanceData.metrics.recall * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Recall</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {(performanceData.metrics.f1_score * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">F1-Score</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {(performanceData.metrics.auc_roc * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">AUC-ROC</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Confusion Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Matriz de Confusão</CardTitle>
                <CardDescription>
                  Distribuição de previsões corretas e incorretas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {performanceData.confusion_matrix.true_positive}
                    </div>
                    <div className="text-sm text-gray-600">Verdadeiro Positivo</div>
                  </div>

                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {performanceData.confusion_matrix.false_positive}
                    </div>
                    <div className="text-sm text-gray-600">Falso Positivo</div>
                  </div>

                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {performanceData.confusion_matrix.false_negative}
                    </div>
                    <div className="text-sm text-gray-600">Falso Negativo</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {performanceData.confusion_matrix.true_negative}
                    </div>
                    <div className="text-sm text-gray-600">Verdadeiro Negativo</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            {/* Detailed Metrics Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Comparação de Métricas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          name: 'Modelo Atual',
                          accuracy: performanceData.metrics.accuracy * 100,
                          precision: performanceData.metrics.precision * 100,
                          recall: performanceData.metrics.recall * 100,
                          f1_score: performanceData.metrics.f1_score * 100
                        }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, '']} />
                      <Bar dataKey="accuracy" fill="#3b82f6" name="Acurácia" />
                      <Bar dataKey="precision" fill="#10b981" name="Precisão" />
                      <Bar dataKey="recall" fill="#8b5cf6" name="Recall" />
                      <Bar dataKey="f1_score" fill="#f59e0b" name="F1-Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Classe</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={performanceData.class_distribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {performanceData.class_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="curves" className="space-y-6">
            {/* Learning Curves */}
            <Card>
              <CardHeader>
                <CardTitle>Curvas de Aprendizado</CardTitle>
                <CardDescription>
                  Evolução da performance durante o treinamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={performanceData.learning_curve}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="epoch" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="train_accuracy"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Acurácia Treino"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="val_accuracy"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Acurácia Validação"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="train_loss"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Perda Treino"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="val_loss"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Perda Validação"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            {/* Feature Importance */}
            <Card>
              <CardHeader>
                <CardTitle>Importância das Features</CardTitle>
                <CardDescription>
                  Quais características mais influenciam as previsões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={performanceData.feature_importance}
                    layout="horizontal"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Importância']} />
                    <Bar dataKey="importance" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation" className="space-y-6">
            {/* Cross-Validation Results */}
            <Card>
              <CardHeader>
                <CardTitle>Validação Cruzada</CardTitle>
                <CardDescription>
                  Performance consistente através de diferentes divisões dos dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {(performanceData.cross_validation_scores.reduce((a, b) => a + b, 0) / performanceData.cross_validation_scores.length * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Média CV</div>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.max(...performanceData.cross_validation_scores) * 100}%
                      </div>
                      <div className="text-sm text-gray-600">Melhor Score</div>
                    </div>

                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {(Math.max(...performanceData.cross_validation_scores) - Math.min(...performanceData.cross_validation_scores)).toFixed(3)}
                      </div>
                      <div className="text-sm text-gray-600">Variância</div>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData.cross_validation_scores.map((score, index) => ({
                      fold: `Fold ${index + 1}`,
                      score: score * 100
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fold" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Score']} />
                      <Bar dataKey="score" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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
              Escolha um modelo treinado para visualizar suas métricas de performance detalhadas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ModelPerformanceVisualization