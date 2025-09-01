import { useState, useEffect } from 'react'
import { post, ApiError } from '@/services/apiService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import {
  BarChart3,
  TrendingUp,
  Trophy,
  AlertTriangle,
  RefreshCw,
  Play,
  CheckCircle,
  XCircle,
  Minus
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

const ModelComparisonDashboard = () => {
  const [dataSource, setDataSource] = useState('transactions')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedModels, setSelectedModels] = useState({
    random_forest: true,
    xgboost: true,
    lightgbm: true,
    bert: false
  })
  const [comparisonData, setComparisonData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Mock comparison data
  const mockComparisonData = {
    models: [
      {
        name: 'Random Forest',
        accuracy: 0.87,
        precision: 0.85,
        recall: 0.89,
        f1_score: 0.87,
        training_time: 45,
        memory_usage: 120,
        cross_val_mean: 0.86,
        cross_val_std: 0.02,
        rank: 1
      },
      {
        name: 'XGBoost',
        accuracy: 0.89,
        precision: 0.87,
        recall: 0.91,
        f1_score: 0.89,
        training_time: 38,
        memory_usage: 95,
        cross_val_mean: 0.88,
        cross_val_std: 0.015,
        rank: 2
      },
      {
        name: 'LightGBM',
        accuracy: 0.88,
        precision: 0.86,
        recall: 0.90,
        f1_score: 0.88,
        training_time: 25,
        memory_usage: 85,
        cross_val_mean: 0.87,
        cross_val_std: 0.018,
        rank: 3
      },
      {
        name: 'BERT',
        accuracy: 0.92,
        precision: 0.90,
        recall: 0.94,
        f1_score: 0.92,
        training_time: 180,
        memory_usage: 450,
        cross_val_mean: 0.91,
        cross_val_std: 0.025,
        rank: 4
      }
    ],
    best_model: 'BERT',
    recommendation: {
      recommended_model: 'XGBoost',
      confidence_level: 'high',
      reasoning: 'Melhor equilíbrio entre performance e eficiência'
    },
    performance_trends: [
      { time: '0s', random_forest: 0, xgboost: 0, lightgbm: 0, bert: 0 },
      { time: '10s', random_forest: 0.65, xgboost: 0.68, lightgbm: 0.66, bert: 0.45 },
      { time: '20s', random_forest: 0.78, xgboost: 0.82, lightgbm: 0.79, bert: 0.62 },
      { time: '30s', random_forest: 0.85, xgboost: 0.87, lightgbm: 0.86, bert: 0.78 },
      { time: '40s', random_forest: 0.87, xgboost: 0.89, lightgbm: 0.88, bert: 0.85 },
      { time: '50s', random_forest: 0.87, xgboost: 0.89, lightgbm: 0.88, bert: 0.92 }
    ]
  }

  const runComparison = async () => {
    const modelsToCompare = Object.entries(selectedModels)
      .filter(([_, selected]) => selected)
      .map(([model, _]) => model)

    if (modelsToCompare.length < 2) {
      setError('Selecione pelo menos 2 modelos para comparar')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // In production, this would call the actual API
      // const data = await post('api/models/compare', {
      //   data_source: dataSource,
      //   models_to_compare: modelsToCompare,
      //   start_date: startDate || undefined,
      //   end_date: endDate || undefined
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setComparisonData(mockComparisonData)
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError('Erro ao executar comparação de modelos')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleModelSelection = (model, checked) => {
    setSelectedModels(prev => ({
      ...prev,
      [model]: checked
    }))
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 2:
        return <Trophy className="h-4 w-4 text-gray-400" />
      case 3:
        return <Trophy className="h-4 w-4 text-orange-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-300" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Dashboard de Comparação de Modelos
          </CardTitle>
          <CardDescription>
            Compare o desempenho de diferentes algoritmos de ML lado a lado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Source Configuration */}
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

          {/* Model Selection */}
          <div className="space-y-4">
            <Label>Selecione os Modelos para Comparar</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(selectedModels).map(([model, selected]) => (
                <div key={model} className="flex items-center space-x-2">
                  <Checkbox
                    id={model}
                    checked={selected}
                    onCheckedChange={(checked) => handleModelSelection(model, checked)}
                  />
                  <Label htmlFor={model} className="text-sm font-medium">
                    {model.replace('_', ' ').toUpperCase()}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={runComparison} disabled={loading} size="lg">
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Comparando Modelos...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Executar Comparação
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
            <span>Executando comparação de modelos...</span>
          </CardContent>
        </Card>
      )}

      {comparisonData && !loading && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Best Model Recommendation */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <Trophy className="h-5 w-5 mr-2" />
                  Recomendação: {comparisonData.recommendation.recommended_model}
                </CardTitle>
                <CardDescription className="text-green-700">
                  {comparisonData.recommendation.reasoning}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Model Rankings */}
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Modelos</CardTitle>
                <CardDescription>
                  Performance geral ordenada por F1-Score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comparisonData.models.map((model, index) => (
                    <div key={model.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getRankIcon(model.rank)}
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-gray-500">
                            Rank #{model.rank}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {(model.f1_score * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          F1-Score
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            {/* Metrics Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Comparação de Acurácia</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData.models}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Acurácia']} />
                      <Bar dataKey="accuracy" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comparação de F1-Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData.models}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'F1-Score']} />
                      <Bar dataKey="f1_score" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Radar Chart for All Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Comparação Multidimensional</CardTitle>
                <CardDescription>
                  Visão geral de todas as métricas para cada modelo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={comparisonData.models}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 1]} />
                    <Radar
                      name="Acurácia"
                      dataKey="accuracy"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.1}
                    />
                    <Radar
                      name="Precisão"
                      dataKey="precision"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.1}
                    />
                    <Radar
                      name="Recall"
                      dataKey="recall"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.1}
                    />
                    <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, '']} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tempo de Treinamento</CardTitle>
                  <CardDescription>Segundos necessários para treinar cada modelo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData.models}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}s`, 'Tempo']} />
                      <Bar dataKey="training_time" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Uso de Memória</CardTitle>
                  <CardDescription>MB de memória utilizados durante o treinamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData.models}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} MB`, 'Memória']} />
                      <Bar dataKey="memory_usage" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Performance Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução da Performance</CardTitle>
                <CardDescription>
                  Como a acurácia evoluiu durante o treinamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={comparisonData.performance_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Acurácia']} />
                    <Line
                      type="monotone"
                      dataKey="random_forest"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Random Forest"
                    />
                    <Line
                      type="monotone"
                      dataKey="xgboost"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="XGBoost"
                    />
                    <Line
                      type="monotone"
                      dataKey="lightgbm"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="LightGBM"
                    />
                    <Line
                      type="monotone"
                      dataKey="bert"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="BERT"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ranking" className="space-y-6">
            {/* Detailed Rankings */}
            <Card>
              <CardHeader>
                <CardTitle>Ranking Detalhado</CardTitle>
                <CardDescription>
                  Comparação completa de todas as métricas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Modelo</th>
                        <th className="text-center p-2">Rank</th>
                        <th className="text-center p-2">Acurácia</th>
                        <th className="text-center p-2">Precisão</th>
                        <th className="text-center p-2">Recall</th>
                        <th className="text-center p-2">F1-Score</th>
                        <th className="text-center p-2">Tempo</th>
                        <th className="text-center p-2">Memória</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.models.map((model) => (
                        <tr key={model.name} className="border-b">
                          <td className="p-2 font-medium">{model.name}</td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center">
                              {getRankIcon(model.rank)}
                              <span className="ml-1">#{model.rank}</span>
                            </div>
                          </td>
                          <td className="p-2 text-center">{(model.accuracy * 100).toFixed(1)}%</td>
                          <td className="p-2 text-center">{(model.precision * 100).toFixed(1)}%</td>
                          <td className="p-2 text-center">{(model.recall * 100).toFixed(1)}%</td>
                          <td className="p-2 text-center font-bold">{(model.f1_score * 100).toFixed(1)}%</td>
                          <td className="p-2 text-center">{model.training_time}s</td>
                          <td className="p-2 text-center">{model.memory_usage}MB</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Cross-Validation Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Validação Cruzada</CardTitle>
                <CardDescription>
                  Estabilidade da performance através de diferentes folds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={comparisonData.models}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cross_val_mean" type="number" domain={[0.8, 1]} />
                    <YAxis dataKey="cross_val_std" type="number" domain={[0, 0.05]} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'cross_val_mean') return [`${(value * 100).toFixed(1)}%`, 'Média CV']
                        if (name === 'cross_val_std') return [`${(value * 100).toFixed(2)}%`, 'Desvio CV']
                        return [value, name]
                      }}
                    />
                    <Scatter dataKey="cross_val_std" fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!comparisonData && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Configure a Comparação
            </h3>
            <p className="text-gray-500 text-center">
              Selecione os modelos e parâmetros acima para executar uma comparação detalhada
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ModelComparisonDashboard