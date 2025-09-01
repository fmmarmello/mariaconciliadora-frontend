import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.jsx'
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  HelpCircle,
  Bug,
  Zap,
  Shield,
  Wifi,
  Database,
  Cpu,
  AlertCircle
} from 'lucide-react'

const ErrorHandling = () => {
  const [activeTab, setActiveTab] = useState('current')
  const [errorHistory, setErrorHistory] = useState([])
  const [systemStatus, setSystemStatus] = useState({
    backend: 'online',
    database: 'online',
    models: 'online',
    api: 'online'
  })

  // Mock error scenarios for demonstration
  const mockErrors = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'API_ERROR',
      severity: 'high',
      title: 'Falha na Conexão com Backend',
      message: 'Não foi possível conectar ao servidor de ML',
      details: 'Timeout de 30 segundos excedido ao tentar conectar com api/models/train',
      component: 'AITraining',
      userAction: 'Verificar se o servidor backend está rodando',
      technicalDetails: {
        endpoint: '/api/models/train',
        method: 'POST',
        statusCode: 500,
        responseTime: '30.5s',
        errorCode: 'CONNECTION_TIMEOUT'
      },
      resolution: 'Reiniciar o servidor backend resolveu o problema',
      resolved: true,
      resolvedAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: 'VALIDATION_ERROR',
      severity: 'medium',
      title: 'Dados de Treinamento Inválidos',
      message: 'Os dados fornecidos não atendem aos requisitos mínimos',
      details: 'Dataset deve ter pelo menos 10 amostras para treinamento',
      component: 'ModelComparisonDashboard',
      userAction: 'Adicionar mais dados de treinamento ou reduzir filtros',
      technicalDetails: {
        validationRule: 'MIN_SAMPLES',
        required: 10,
        provided: 3,
        dataSource: 'transactions'
      },
      resolution: 'Usuário adicionou mais dados e conseguiu treinar o modelo',
      resolved: true,
      resolvedAt: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 900000).toISOString(),
      type: 'MEMORY_ERROR',
      severity: 'high',
      title: 'Memória Insuficiente',
      message: 'O sistema ficou sem memória durante o processamento',
      details: 'BERT model training exceeded 8GB memory limit',
      component: 'HyperparameterOptimization',
      userAction: 'Usar modelo menor ou aumentar recursos do sistema',
      technicalDetails: {
        memoryUsed: '8.2GB',
        memoryLimit: '8GB',
        modelType: 'BERT',
        operation: 'training'
      },
      resolution: 'Mudou para LightGBM que usa menos memória',
      resolved: true,
      resolvedAt: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      type: 'MODEL_ERROR',
      severity: 'low',
      title: 'Modelo Não Encontrado',
      message: 'O modelo solicitado não está disponível',
      details: 'Model xgboost_v2 não existe no sistema',
      component: 'ModelPerformanceVisualization',
      userAction: 'Selecionar um modelo diferente ou treinar um novo',
      technicalDetails: {
        requestedModel: 'xgboost_v2',
        availableModels: ['random_forest', 'xgboost', 'lightgbm', 'bert'],
        operation: 'prediction'
      },
      resolution: 'Usuário selecionou modelo xgboost disponível',
      resolved: true,
      resolvedAt: new Date(Date.now() - 120000).toISOString()
    }
  ]

  const troubleshootingGuides = [
    {
      category: 'Conectividade',
      icon: <Wifi className="h-5 w-5" />,
      issues: [
        {
          title: 'Servidor Backend Indisponível',
          symptoms: ['Erro de conexão', 'Timeout', 'Servidor não responde'],
          solutions: [
            'Verificar se o servidor backend está rodando',
            'Checar configurações de firewall',
            'Verificar conexão de rede',
            'Reiniciar serviços'
          ]
        },
        {
          title: 'API Endpoints Não Respondem',
          symptoms: ['404 Not Found', '500 Internal Server Error'],
          solutions: [
            'Verificar se as rotas estão registradas',
            'Checar logs do servidor',
            'Validar parâmetros da requisição',
            'Testar endpoints individualmente'
          ]
        }
      ]
    },
    {
      category: 'Dados',
      icon: <Database className="h-5 w-5" />,
      issues: [
        {
          title: 'Dados Insuficientes',
          symptoms: ['Erro de validação', 'MIN_SAMPLES error'],
          solutions: [
            'Adicionar mais dados de treinamento',
            'Reduzir filtros de data',
            'Incluir mais fontes de dados',
            'Usar técnicas de data augmentation'
          ]
        },
        {
          title: 'Dados Corrompidos',
          symptoms: ['NaN values', 'Invalid format', 'Parse errors'],
          solutions: [
            'Validar formato dos dados',
            'Limpar dados antes do processamento',
            'Checar encoding dos arquivos',
            'Usar validação de entrada'
          ]
        }
      ]
    },
    {
      category: 'Recursos',
      icon: <Cpu className="h-5 w-5" />,
      issues: [
        {
          title: 'Memória Insuficiente',
          symptoms: ['Out of memory', 'Killed process', 'Memory error'],
          solutions: [
            'Usar modelos menores',
            'Reduzir batch size',
            'Aumentar recursos do sistema',
            'Usar técnicas de otimização de memória'
          ]
        },
        {
          title: 'CPU/GPU Sobrecarregado',
          symptoms: ['Processo lento', 'Timeout', 'High CPU usage'],
          solutions: [
            'Reduzir complexidade do modelo',
            'Usar processamento assíncrono',
            'Otimizar algoritmos',
            'Distribuir carga de trabalho'
          ]
        }
      ]
    },
    {
      category: 'Modelos',
      icon: <Zap className="h-5 w-5" />,
      issues: [
        {
          title: 'Modelo Não Encontrado',
          symptoms: ['Model not found', 'Invalid model name'],
          solutions: [
            'Verificar lista de modelos disponíveis',
            'Treinar novo modelo se necessário',
            'Checar persistência de modelos',
            'Validar nomes de modelos'
          ]
        },
        {
          title: 'Erro de Predição',
          symptoms: ['Prediction failed', 'Invalid input format'],
          solutions: [
            'Validar formato dos dados de entrada',
            'Checar pré-processamento',
            'Verificar compatibilidade do modelo',
            'Usar fallback mechanisms'
          ]
        }
      ]
    }
  ]

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getSystemStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800'
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800'
      case 'offline':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const simulateError = (errorType) => {
    const newError = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: errorType,
      severity: 'medium',
      title: `Erro Simulado: ${errorType}`,
      message: 'Este é um erro simulado para demonstração',
      details: 'Erro gerado para testar o sistema de tratamento de erros',
      component: 'ErrorHandling',
      userAction: 'Este é apenas um teste',
      technicalDetails: {
        simulated: true,
        errorType: errorType
      },
      resolved: false
    }

    setErrorHistory(prev => [newError, ...prev])
  }

  const resolveError = (errorId) => {
    setErrorHistory(prev =>
      prev.map(error =>
        error.id === errorId
          ? { ...error, resolved: true, resolvedAt: new Date().toISOString() }
          : error
      )
    )
  }

  const clearResolvedErrors = () => {
    setErrorHistory(prev => prev.filter(error => !error.resolved))
  }

  useEffect(() => {
    // Simulate loading error history
    setErrorHistory(mockErrors)
  }, [])

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Status do Sistema
          </CardTitle>
          <CardDescription>
            Monitoramento da saúde dos componentes do sistema ML
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  systemStatus.backend === 'online' ? 'bg-green-500' :
                  systemStatus.backend === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">Backend</span>
              </div>
              <Badge className={getSystemStatusColor(systemStatus.backend)}>
                {systemStatus.backend}
              </Badge>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  systemStatus.database === 'online' ? 'bg-green-500' :
                  systemStatus.database === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">Database</span>
              </div>
              <Badge className={getSystemStatusColor(systemStatus.database)}>
                {systemStatus.database}
              </Badge>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  systemStatus.models === 'online' ? 'bg-green-500' :
                  systemStatus.models === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">Modelos</span>
              </div>
              <Badge className={getSystemStatusColor(systemStatus.models)}>
                {systemStatus.models}
              </Badge>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  systemStatus.api === 'online' ? 'bg-green-500' :
                  systemStatus.api === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">API</span>
              </div>
              <Badge className={getSystemStatusColor(systemStatus.api)}>
                {systemStatus.api}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">Erros Atuais</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="troubleshooting">Soluções</TabsTrigger>
          <TabsTrigger value="testing">Testes</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Current Errors */}
          <Card>
            <CardHeader>
              <CardTitle>Erros Atuais</CardTitle>
              <CardDescription>
                Problemas ativos que precisam de atenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorHistory.filter(error => !error.resolved).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Nenhum erro ativo no momento</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {errorHistory.filter(error => !error.resolved).map((error) => (
                    <Alert key={error.id} variant="destructive">
                      <div className="flex items-start">
                        {getSeverityIcon(error.severity)}
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{error.title}</h4>
                            <Badge className={getSeverityColor(error.severity)}>
                              {error.severity}
                            </Badge>
                          </div>
                          <AlertDescription className="mb-3">
                            {error.message}
                          </AlertDescription>
                          <div className="text-sm text-gray-600 mb-3">
                            <p><strong>Componente:</strong> {error.component}</p>
                            <p><strong>Ação do Usuário:</strong> {error.userAction}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => resolveError(error.id)}>
                              Marcar como Resolvido
                            </Button>
                            <Button size="sm" variant="outline">
                              <HelpCircle className="h-4 w-4 mr-1" />
                              Ajuda
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Error History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Histórico de Erros</span>
                <Button size="sm" variant="outline" onClick={clearResolvedErrors}>
                  Limpar Resolvidos
                </Button>
              </CardTitle>
              <CardDescription>
                Todos os erros registrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errorHistory.map((error) => (
                  <Card key={error.id} className={error.resolved ? 'opacity-60' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(error.severity)}
                          <h4 className="font-medium">{error.title}</h4>
                          {error.resolved && (
                            <Badge className="bg-green-100 text-green-800">
                              Resolvido
                            </Badge>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>{new Date(error.timestamp).toLocaleDateString()}</div>
                          <div>{new Date(error.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Tipo:</strong> {error.type}</p>
                          <p><strong>Componente:</strong> {error.component}</p>
                          <p><strong>Gravidade:</strong>
                            <Badge className={`ml-2 ${getSeverityColor(error.severity)}`}>
                              {error.severity}
                            </Badge>
                          </p>
                        </div>
                        <div>
                          <p><strong>Status:</strong> {error.resolved ? 'Resolvido' : 'Ativo'}</p>
                          {error.resolved && error.resolvedAt && (
                            <p><strong>Resolvido em:</strong> {new Date(error.resolvedAt).toLocaleString()}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        <p><strong>Detalhes:</strong> {error.details}</p>
                        <p><strong>Ação:</strong> {error.userAction}</p>
                      </div>

                      {error.technicalDetails && (
                        <details className="mt-3">
                          <summary className="text-sm font-medium cursor-pointer">
                            Detalhes Técnicos
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(error.technicalDetails, null, 2)}
                          </pre>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          {/* Troubleshooting Guides */}
          <Card>
            <CardHeader>
              <CardTitle>Guias de Solução de Problemas</CardTitle>
              <CardDescription>
                Soluções para problemas comuns no sistema ML
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {troubleshootingGuides.map((category, categoryIndex) => (
                  <AccordionItem key={categoryIndex} value={`category-${categoryIndex}`}>
                    <AccordionTrigger className="flex items-center">
                      {category.icon}
                      <span className="ml-2">{category.category}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {category.issues.map((issue, issueIndex) => (
                          <div key={issueIndex} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">{issue.title}</h4>

                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-700 mb-1">Sintomas:</h5>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {issue.symptoms.map((symptom, symptomIndex) => (
                                  <li key={symptomIndex} className="flex items-center">
                                    <XCircle className="h-3 w-3 text-red-500 mr-2" />
                                    {symptom}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-1">Soluções:</h5>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {issue.solutions.map((solution, solutionIndex) => (
                                  <li key={solutionIndex} className="flex items-center">
                                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                                    {solution}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          {/* Error Testing Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bug className="h-5 w-5 mr-2" />
                Ferramentas de Teste
              </CardTitle>
              <CardDescription>
                Teste o sistema de tratamento de erros (apenas para desenvolvimento)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => simulateError('API_ERROR')}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Wifi className="h-6 w-6 mb-2 text-red-500" />
                  <span>Simular Erro de API</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => simulateError('VALIDATION_ERROR')}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <AlertTriangle className="h-6 w-6 mb-2 text-yellow-500" />
                  <span>Simular Erro de Validação</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => simulateError('MEMORY_ERROR')}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Cpu className="h-6 w-6 mb-2 text-orange-500" />
                  <span>Simular Erro de Memória</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => simulateError('MODEL_ERROR')}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Zap className="h-6 w-6 mb-2 text-purple-500" />
                  <span>Simular Erro de Modelo</span>
                </Button>
              </div>

              <Alert className="mt-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> Estas ferramentas são apenas para teste e desenvolvimento.
                  Os erros simulados aparecerão no histórico de erros.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* System Health Check */}
          <Card>
            <CardHeader>
              <CardTitle>Verificação de Saúde do Sistema</CardTitle>
              <CardDescription>
                Status atual de todos os componentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span>Conectividade Backend</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span>Database Connection</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span>Model Services</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span>API Endpoints</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ErrorHandling