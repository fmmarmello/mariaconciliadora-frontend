import { useState, useEffect, useRef } from 'react'
import { post, ApiError } from '@/services/apiService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import {
  Activity,
  TrendingUp,
  Clock,
  Cpu,
  Zap,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Square,
  RefreshCw,
  BarChart3,
  LineChart
} from 'lucide-react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts'

const TrainingProgress = () => {
  const [isTraining, setIsTraining] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [totalEpochs, setTotalEpochs] = useState(100)
  const [metrics, setMetrics] = useState({
    loss: [],
    accuracy: [],
    val_loss: [],
    val_accuracy: [],
    learning_rate: []
  })
  const [systemMetrics, setSystemMetrics] = useState({
    cpu_usage: [],
    memory_usage: [],
    gpu_usage: []
  })
  const [logs, setLogs] = useState([])
  const [trainingStatus, setTrainingStatus] = useState('idle') // 'idle', 'running', 'paused', 'completed', 'error'
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('progress')
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)

  // Mock real-time training data
  const mockTrainingData = {
    epochs: 100,
    current_epoch: 0,
    metrics_history: [],
    system_metrics: [],
    logs: [
      { timestamp: Date.now(), level: 'info', message: 'Training started' },
      { timestamp: Date.now() + 1000, level: 'info', message: 'Loading training data...' },
      { timestamp: Date.now() + 2000, level: 'info', message: 'Initializing model...' }
    ]
  }

  const startTraining = () => {
    setIsTraining(true)
    setTrainingStatus('running')
    setProgress(0)
    setCurrentEpoch(0)
    setError(null)
    startTimeRef.current = Date.now()

    // Reset metrics
    setMetrics({
      loss: [],
      accuracy: [],
      val_loss: [],
      val_accuracy: [],
      learning_rate: []
    })
    setSystemMetrics({
      cpu_usage: [],
      memory_usage: [],
      gpu_usage: []
    })
    setLogs(mockTrainingData.logs)

    // Start real-time updates
    intervalRef.current = setInterval(() => {
      updateTrainingProgress()
    }, 1000)
  }

  const pauseTraining = () => {
    setTrainingStatus('paused')
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const resumeTraining = () => {
    setTrainingStatus('running')
    intervalRef.current = setInterval(() => {
      updateTrainingProgress()
    }, 1000)
  }

  const stopTraining = () => {
    setIsTraining(false)
    setTrainingStatus('idle')
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const updateTrainingProgress = () => {
    const elapsed = Date.now() - startTimeRef.current
    const newEpoch = Math.min(Math.floor((elapsed / 1000) * 2), totalEpochs) // 2 epochs per second simulation
    const newProgress = (newEpoch / totalEpochs) * 100

    setCurrentEpoch(newEpoch)
    setProgress(newProgress)

    // Simulate metrics updates
    const currentTime = Date.now()
    const baseLoss = Math.max(0.1, 2.0 - (newEpoch / totalEpochs) * 1.8)
    const noise = (Math.random() - 0.5) * 0.1

    const newMetrics = {
      loss: [...metrics.loss, {
        time: currentTime,
        value: baseLoss + noise,
        epoch: newEpoch
      }],
      accuracy: [...metrics.accuracy, {
        time: currentTime,
        value: Math.min(0.95, 0.5 + (newEpoch / totalEpochs) * 0.4 + Math.random() * 0.05),
        epoch: newEpoch
      }],
      val_loss: [...metrics.val_loss, {
        time: currentTime,
        value: Math.max(0.05, baseLoss + 0.1 + noise * 0.5),
        epoch: newEpoch
      }],
      val_accuracy: [...metrics.val_accuracy, {
        time: currentTime,
        value: Math.min(0.9, 0.45 + (newEpoch / totalEpochs) * 0.35 + Math.random() * 0.03),
        epoch: newEpoch
      }],
      learning_rate: [...metrics.learning_rate, {
        time: currentTime,
        value: Math.max(0.0001, 0.001 * Math.pow(0.95, newEpoch)),
        epoch: newEpoch
      }]
    }

    const newSystemMetrics = {
      cpu_usage: [...systemMetrics.cpu_usage, {
        time: currentTime,
        value: 60 + Math.random() * 30,
        epoch: newEpoch
      }],
      memory_usage: [...systemMetrics.memory_usage, {
        time: currentTime,
        value: 70 + Math.random() * 20,
        epoch: newEpoch
      }],
      gpu_usage: [...systemMetrics.gpu_usage, {
        time: currentTime,
        value: 80 + Math.random() * 15,
        epoch: newEpoch
      }]
    }

    setMetrics(newMetrics)
    setSystemMetrics(newSystemMetrics)

    // Add training logs
    if (newEpoch % 10 === 0 && newEpoch > 0) {
      const newLog = {
        timestamp: currentTime,
        level: 'info',
        message: `Epoch ${newEpoch}/${totalEpochs} - Loss: ${(baseLoss + noise).toFixed(4)}, Accuracy: ${((0.5 + (newEpoch / totalEpochs) * 0.4) * 100).toFixed(2)}%`
      }
      setLogs(prev => [...prev, newLog])
    }

    // Check if training is complete
    if (newEpoch >= totalEpochs) {
      setTrainingStatus('completed')
      setIsTraining(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Add completion log
      setLogs(prev => [...prev, {
        timestamp: Date.now(),
        level: 'success',
        message: 'Training completed successfully!'
      }])
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getElapsedTime = () => {
    if (!startTimeRef.current) return 0
    return Math.floor((Date.now() - startTimeRef.current) / 1000)
  }

  const getEstimatedTimeRemaining = () => {
    if (!isTraining || progress === 0) return 0
    const elapsed = getElapsedTime()
    const remaining = (elapsed / progress) * (100 - progress)
    return Math.floor(remaining)
  }

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      case 'success':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Progresso do Treinamento em Tempo Real
          </CardTitle>
          <CardDescription>
            Monitore o treinamento do modelo com métricas ao vivo e logs detalhados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={
                trainingStatus === 'running' ? 'default' :
                trainingStatus === 'paused' ? 'secondary' :
                trainingStatus === 'completed' ? 'default' :
                'outline'
              }>
                {trainingStatus === 'running' && 'Executando'}
                {trainingStatus === 'paused' && 'Pausado'}
                {trainingStatus === 'completed' && 'Concluído'}
                {trainingStatus === 'idle' && 'Parado'}
              </Badge>

              <div className="text-sm text-gray-600">
                Epoch {currentEpoch}/{totalEpochs}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isTraining && trainingStatus !== 'completed' && (
                <Button onClick={startTraining} size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  Iniciar
                </Button>
              )}

              {isTraining && trainingStatus === 'running' && (
                <Button onClick={pauseTraining} variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-1" />
                  Pausar
                </Button>
              )}

              {isTraining && trainingStatus === 'paused' && (
                <Button onClick={resumeTraining} size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  Continuar
                </Button>
              )}

              {isTraining && (
                <Button onClick={stopTraining} variant="destructive" size="sm">
                  <Square className="h-4 w-4 mr-1" />
                  Parar
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do Treinamento</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />

            <div className="flex justify-between text-xs text-gray-500">
              <span>Tempo decorrido: {formatTime(getElapsedTime())}</span>
              <span>Tempo restante: {formatTime(getEstimatedTimeRemaining())}</span>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          {/* Training Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentEpoch}
                  </div>
                  <div className="text-sm text-gray-600">Epoch Atual</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.accuracy.length > 0 ? (metrics.accuracy[metrics.accuracy.length - 1].value * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Acurácia</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {metrics.loss.length > 0 ? metrics.loss[metrics.loss.length - 1].value.toFixed(3) : 0}
                  </div>
                  <div className="text-sm text-gray-600">Loss</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatTime(getElapsedTime())}
                  </div>
                  <div className="text-sm text-gray-600">Tempo</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Loss and Accuracy */}
          {metrics.loss.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Métricas em Tempo Real</CardTitle>
                <CardDescription>
                  Evolução da loss e acurácia durante o treinamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={metrics.loss.map((loss, index) => ({
                    epoch: loss.epoch,
                    loss: loss.value,
                    accuracy: metrics.accuracy[index]?.value || 0,
                    val_loss: metrics.val_loss[index]?.value || 0,
                    val_accuracy: metrics.val_accuracy[index]?.value || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="epoch" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="loss"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Training Loss"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="val_loss"
                      stroke="#f97316"
                      strokeWidth={2}
                      name="Validation Loss"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Training Accuracy"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="val_accuracy"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Validation Accuracy"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Loss ao Longo do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={metrics.loss}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="epoch" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value.toFixed(4), 'Loss']} />
                    <Area type="monotone" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acurácia ao Longo do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={metrics.accuracy}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="epoch" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Acurácia']} />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Learning Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Aprendizado</CardTitle>
              <CardDescription>
                Evolução da learning rate durante o treinamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsLineChart data={metrics.learning_rate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value.toExponential(4), 'Learning Rate']} />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {/* System Resources */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Cpu className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-blue-600">
                    {systemMetrics.cpu_usage.length > 0 ? Math.round(systemMetrics.cpu_usage[systemMetrics.cpu_usage.length - 1].value) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">CPU</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold text-green-600">
                    {systemMetrics.memory_usage.length > 0 ? Math.round(systemMetrics.memory_usage[systemMetrics.memory_usage.length - 1].value) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Memória</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold text-purple-600">
                    {systemMetrics.gpu_usage.length > 0 ? Math.round(systemMetrics.gpu_usage[systemMetrics.gpu_usage.length - 1].value) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">GPU</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Usage Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Uso de Recursos ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={systemMetrics.cpu_usage.map((cpu, index) => ({
                  epoch: cpu.epoch,
                  cpu: cpu.value,
                  memory: systemMetrics.memory_usage[index]?.value || 0,
                  gpu: systemMetrics.gpu_usage[index]?.value || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${Math.round(value)}%`, '']} />
                  <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} name="CPU" />
                  <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} name="Memória" />
                  <Line type="monotone" dataKey="gpu" stroke="#8b5cf6" strokeWidth={2} name="GPU" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          {/* Training Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Logs do Treinamento</CardTitle>
              <CardDescription>
                Mensagens detalhadas do processo de treinamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-500">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span className={`ml-2 ${getLogLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}:
                    </span>
                    <span className="ml-2">{log.message}</span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-gray-500 text-center py-8">
                    Nenhum log disponível. Inicie o treinamento para ver os logs.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Log Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo dos Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {logs.filter(log => log.level === 'info').length}
                  </div>
                  <div className="text-sm text-gray-600">Info</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {logs.filter(log => log.level === 'success').length}
                  </div>
                  <div className="text-sm text-gray-600">Sucesso</div>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {logs.filter(log => log.level === 'warning').length}
                  </div>
                  <div className="text-sm text-gray-600">Aviso</div>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {logs.filter(log => log.level === 'error').length}
                  </div>
                  <div className="text-sm text-gray-600">Erro</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {trainingStatus === 'completed' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-green-800">Treinamento Concluído!</h3>
                <p className="text-green-700">
                  O modelo foi treinado com sucesso em {formatTime(getElapsedTime())}.
                  Você pode agora usar o modelo para fazer previsões ou analisar suas métricas detalhadas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TrainingProgress