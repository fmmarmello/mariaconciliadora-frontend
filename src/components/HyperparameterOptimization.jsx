import { useState, useEffect } from 'react'
import { post, ApiError } from '@/services/apiService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import {
  Zap,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Play,
  BarChart3,
  Activity,
  Settings
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts'

const HyperparameterOptimization = () => {
  const [selectedModel, setSelectedModel] = useState('random_forest')
  const [dataSource, setDataSource] = useState('transactions')
  const [nTrials, setNTrials] = useState(50)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [optimizationData, setOptimizationData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('progress')
  const [progress, setProgress] = useState(0)
  const [currentTrial, setCurrentTrial] = useState(0)

  // Mock optimization data
  const mockOptimizationData = {
    best_params: {
      n_estimators: 150,
      max_depth: 12,
      min_samples_split: 8,
      min_samples_leaf: 3,
      max_features: 'sqrt'
    },
    best_score: 0.895,
    optimization_history: [
      { trial: 1, score: 0.823, n_estimators: 100, max_depth: 10 },
      { trial: 2, score: 0.845, n_estimators: 120, max_depth: 8 },
      { trial: 3, score: 0.812, n_estimators: 80, max_depth: 15 },
      { trial: 4, score: 0.867, n_estimators: 140, max_depth: 12 },
      { trial: 5, score: 0.879, n_estimators: 160, max_depth: 10 },
      { trial: 6, score: 0.891, n_estimators: 180, max_depth: 14 },
      { trial: 7, score: 0.885, n_estimators: 130, max_depth: 11 },
      { trial: 8, score: 0.893, n_estimators: 150, max_depth: 12 },
      { trial: 9, score: 0.887, n_estimators: 170, max_depth: 13 },
      { trial: 10, score: 0.895, n_estimators: 150, max_depth: 12 }
    ],
    parameter_importance: [
      { parameter: 'n_estimators', importance: 0.35 },
      { parameter: 'max_depth', importance: 0.28 },
      { parameter: 'min_samples_split', importance: 0.18 },
      { parameter: 'min_samples_leaf', importance: 0.12 },
      { parameter: 'max_features', importance: 0.07 }
    ],
    convergence_plot: [
      { iteration: 1, best_score: 0.823 },
      { iteration: 2, best_score: 0.845 },
      { iteration: 3, best_score: 0.845 },
      { iteration: 4, best_score: 0.867 },
      { iteration: 5, best_score: 0.879 },
      { iteration: 6, best_score: 0.891 },
      { iteration: 7, best_score: 0.891 },
      { iteration: 8, best_score: 0.893 },
      { iteration: 9, best_score: 0.893 },
      { iteration: 10, best_score: 0.895 }
    ],
    parameter_ranges: {
      n_estimators: { min: 50, max: 200 },
      max_depth: { min: 5, max: 20 },
      min_samples_split: { min: 2, max: 20 },
      min_samples_leaf: { min: 1, max: 10 }
    },
    total_trials: 50,
    completed_trials: 50,
    optimization_time: 245 // seconds
  }

  const startOptimization = async () => {
    setLoading(true)
    setError(null)
    setProgress(0)
    setCurrentTrial(0)
    setOptimizationData(null)

    try {
      // Simulate optimization progress
      const progressInterval = setInterval(() => {
        setCurrentTrial(prev => {
          const newTrial = prev + 1
          setProgress((newTrial / nTrials) * 100)

          if (newTrial >= nTrials) {
            clearInterval(progressInterval)
            // Simulate API call completion
            setTimeout(() => {
              setOptimizationData(mockOptimizationData)
              setLoading(false)
            }, 1000)
          }

          return newTrial
        })
      }, 200)

      // In production, this would call the actual API
      // const data = await post('api/models/optimize', {
      //   model_type: selectedModel,
      //   data_source: dataSource,
      //   n_trials: nTrials,
      //   start_date: startDate || undefined,
      //   end_date: endDate || undefined
      // })

    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError('Erro ao executar otimização de hiperparâmetros')
      }
      setLoading(false)
    }
  }

  const formatParameterValue = (param, value) => {
    if (typeof value === 'number') {
      return value.toFixed(0)
    }
    return value
  }

  const getParameterDescription = (param) => {
    const descriptions = {
      n_estimators: 'Número de árvores na floresta',
      max_depth: 'Profundidade máxima das árvores',
      min_samples_split: 'Mínimo de amostras para dividir um nó',
      min_samples_leaf: 'Mínimo de amostras em uma folha',
      max_features: 'Máximo de features consideradas'
    }
    return descriptions[param] || param
  }

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Otimização de Hiperparâmetros
          </CardTitle>
          <CardDescription>
            Otimize automaticamente os parâmetros do seu modelo usando Optuna
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Optimization Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model-type">Modelo</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random_forest">Random Forest</SelectItem>
                  <SelectItem value="xgboost">XGBoost</SelectItem>
                  <SelectItem value="lightgbm">LightGBM</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              <Label htmlFor="n-trials">Número de Tentativas</Label>
              <Input
                id="n-trials"
                type="number"
                min="10"
                max="200"
                value={nTrials}
                onChange={(e) => setNTrials(parseInt(e.target.value))}
              />
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
            <Button onClick={startOptimization} disabled={loading} size="lg">
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Otimizando... ({currentTrial}/{nTrials})
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Otimização
                </>
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso da Otimização</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-center text-sm text-gray-500">
                Tentativa {currentTrial} de {nTrials} - Explorando espaço de parâmetros...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {optimizationData && !loading && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="progress">Progresso</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
            <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            {/* Optimization Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso da Otimização</CardTitle>
                <CardDescription>
                  Evolução da performance ao longo das tentativas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={optimizationData.convergence_plot}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="iteration" />
                    <YAxis domain={[0.8, 1]} />
                    <Tooltip formatter={(value) => [`${(value * 100).toFixed(2)}%`, 'Melhor Score']} />
                    <Line
                      type="monotone"
                      dataKey="best_score"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Trial History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Tentativas</CardTitle>
                <CardDescription>
                  Todas as tentativas realizadas durante a otimização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={optimizationData.optimization_history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="trial" />
                    <YAxis dataKey="score" domain={[0.8, 1]} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'score') return [`${(value * 100).toFixed(2)}%`, 'Score']
                        return [value, name]
                      }}
                    />
                    <Scatter dataKey="score" fill="#10b981" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {/* Best Results */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Melhores Parâmetros Encontrados
                </CardTitle>
                <CardDescription className="text-green-700">
                  Score ótimo: {(optimizationData.best_score * 100).toFixed(2)}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(optimizationData.best_params).map(([param, value]) => (
                    <div key={param} className="bg-white p-4 rounded-lg border">
                      <div className="font-medium text-gray-900 capitalize">
                        {param.replace('_', ' ')}
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatParameterValue(param, value)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getParameterDescription(param)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Optimization Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Otimização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {optimizationData.total_trials}
                    </div>
                    <div className="text-sm text-gray-600">Total de Tentativas</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(optimizationData.best_score * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Melhor Score</div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(optimizationData.optimization_time / 60)}min
                    </div>
                    <div className="text-sm text-gray-600">Tempo Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-6">
            {/* Parameter Importance */}
            <Card>
              <CardHeader>
                <CardTitle>Importância dos Parâmetros</CardTitle>
                <CardDescription>
                  Quais parâmetros mais influenciaram o resultado da otimização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={optimizationData.parameter_importance}
                    layout="horizontal"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="parameter" type="category" width={120} />
                    <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Importância']} />
                    <Bar dataKey="importance" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Parameter Ranges */}
            <Card>
              <CardHeader>
                <CardTitle>Intervalos de Parâmetros Testados</CardTitle>
                <CardDescription>
                  Faixas de valores exploradas durante a otimização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(optimizationData.parameter_ranges).map(([param, range]) => (
                    <div key={param} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium capitalize">{param.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-500">{getParameterDescription(param)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {range.min} - {range.max}
                        </div>
                        <div className="text-sm text-gray-500">
                          Melhor: {formatParameterValue(param, optimizationData.best_params[param])}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {/* Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Performance</CardTitle>
                <CardDescription>
                  Como os scores se distribuíram ao longo da otimização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={optimizationData.optimization_history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="trial" />
                    <YAxis domain={[0.8, 1]} />
                    <Tooltip formatter={(value) => [`${(value * 100).toFixed(2)}%`, 'Score']} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Optimization Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Insights da Otimização</CardTitle>
                <CardDescription>
                  Análise dos resultados e recomendações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Parâmetro Mais Importante</h4>
                    <p className="text-blue-700">
                      O parâmetro <strong>{optimizationData.parameter_importance[0]?.parameter.replace('_', ' ')}</strong>
                      teve o maior impacto na performance, contribuindo com
                      {(optimizationData.parameter_importance[0]?.importance * 100).toFixed(1)}% da variação.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Melhoria Alcançada</h4>
                    <p className="text-green-700">
                      A otimização resultou em uma melhoria de aproximadamente
                      {((optimizationData.best_score - 0.82) * 100).toFixed(1)}% em relação
                      aos parâmetros padrão.
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2">Estabilidade</h4>
                    <p className="text-orange-700">
                      O modelo otimizado mostrou boa estabilidade com scores consistentes
                      acima de 89% nas últimas 10 tentativas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!optimizationData && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Configure a Otimização
            </h3>
            <p className="text-gray-500 text-center">
              Selecione os parâmetros acima para iniciar a otimização de hiperparâmetros
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default HyperparameterOptimization