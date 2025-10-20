import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  BarChart3,
  Calendar,
  AlertTriangle,
  Brain,
  ToggleLeft
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
  Bar
} from 'recharts'
import { get, post, ApiError } from '@/services/apiService';
import { anomalyDetectionService } from '@/services/anomalyDetectionService.js';

const Reconciliation = () => {
  const [pendingRecords, setPendingRecords] = useState([])
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reconciling, setReconciling] = useState(false)
  const [anomalyMode, setAnomalyMode] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPendingReconciliations()
    fetchReconciliationReport()
  }, [])

  const fetchPendingReconciliations = async () => {
    try {
      const data = await get('/reconciliation/pending')
      
      if (data.success) {
        setPendingRecords(data.data.records)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao carregar reconciliações pendentes: ' + err.message)
      }
    }
  }

  const fetchReconciliationReport = async () => {
    try {
      const data = await get('/reconciliation/report')
      
      if (data.success) {
        setReport(data.data)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao carregar relatório de reconciliação: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const startReconciliation = async () => {
    setReconciling(true)
    setError(null)
    
    try {
      const data = await post('/reconciliation')
      
      if (data.success) {
        // Atualiza os dados após a reconciliação
        fetchPendingReconciliations()
        fetchReconciliationReport()
      } else {
        setError(data.error || 'Erro ao iniciar reconciliação')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao iniciar reconciliação: ' + err.message)
      }
    } finally {
      setReconciling(false)
    }
  }

  const startAnomalyDetectionReconciliation = async () => {
    setReconciling(true)
    setError(null)
    
    try {
      const params = {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias atrás
        end_date: new Date().toISOString().split('T')[0],
        user_id: 1 // TODO: Get from auth context
      }
      
      const data = await anomalyDetectionService.processReconciliationWithAnomalyDetection(params)
      
      if (data.success) {
        // Atualiza os dados após a reconciliação com detecção de anomalias
        fetchPendingReconciliations()
        fetchReconciliationReport()
      } else {
        setError(data.error || 'Erro ao iniciar reconciliação com detecção de anomalias')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao iniciar reconciliação com detecção de anomalias: ' + err.message)
      }
    } finally {
      setReconciling(false)
    }
  }

  const confirmReconciliation = async (reconciliationId) => {
    try {
      const data = await post(`/reconciliation/${reconciliationId}/confirm`)
      
      if (data.success) {
        // Atualiza os dados após a confirmação
        fetchPendingReconciliations()
        fetchReconciliationReport()
      } else {
        setError(data.error || 'Erro ao confirmar reconciliação')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao confirmar reconciliação: ' + err.message)
      }
    }
  }

  const rejectReconciliation = async (reconciliationId) => {
    try {
      const data = await post(`/reconciliation/${reconciliationId}/reject`)
      
      if (data.success) {
        // Atualiza os dados após a rejeição
        fetchPendingReconciliations()
        fetchReconciliationReport()
      } else {
        setError(data.error || 'Erro ao rejeitar reconciliação')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao rejeitar reconciliação: ' + err.message)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Resumo de Reconciliação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-900">{report.summary.total_records}</div>
                <div className="text-sm text-blue-700">Total</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-900">{report.summary.confirmed}</div>
                <div className="text-sm text-green-700">Confirmadas</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-900">{report.summary.pending}</div>
                <div className="text-sm text-yellow-700">Pendentes</div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-900">{report.summary.rejected}</div>
                <div className="text-sm text-red-700">Rejeitadas</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-900">
                  {Math.round(report.summary.reconciliation_rate * 100)}%
                </div>
                <div className="text-sm text-purple-700">Taxa</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-col space-y-4">
                {/* Toggle para modo de detecção de anomalias */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Modo de Detecção de Anomalias
                    </span>
                    <Badge variant={anomalyMode ? "default" : "secondary"}>
                      {anomalyMode ? "Ativado" : "Desativado"}
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => setAnomalyMode(!anomalyMode)}
                    variant="outline"
                    size="sm"
                  >
                    <ToggleLeft className="h-4 w-4 mr-2" />
                    {anomalyMode ? "Desativar" : "Ativar"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Valor Reconciliado: R$ {report.financials.total_reconciled_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={startReconciliation} 
                      disabled={reconciling}
                      variant="outline"
                    >
                      {reconciling ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Reconciliando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Iniciar Reconciliação
                        </>
                      )}
                    </Button>
                    
                    {anomalyMode && (
                      <Button 
                        onClick={startAnomalyDetectionReconciliation} 
                        disabled={reconciling}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {reconciling ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Detectando...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4 mr-2" />
                            Reconciliar com IA
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Reconciliações Pendentes */}
      {pendingRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Reconciliações Pendentes
            </CardTitle>
            <CardDescription>
              {pendingRecords.length} correspondências aguardando confirmação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary">
                          Score: {Math.round(record.match_score * 100)}%
                        </Badge>
                        <Badge variant="outline">
                          ID: {record.id}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-1">Transação Bancária</h4>
                          <p className="text-sm text-gray-600">
                            {record.bank_transaction?.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {record.bank_transaction?.bank_name} • {new Date(record.bank_transaction?.date).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            R$ {Math.abs(record.bank_transaction?.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm mb-1">Entrada Financeira</h4>
                          <p className="text-sm text-gray-600">
                            {record.company_entry?.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {record.company_entry?.category} • {new Date(record.company_entry?.date).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            R$ {Math.abs(record.company_entry?.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => confirmReconciliation(record.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => rejectReconciliation(record.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não há pendências */}
      {pendingRecords.length === 0 && !reconciling && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma reconciliação pendente</h3>
            <p className="text-gray-500 text-center mb-4">
              Todas as correspondências foram confirmadas ou rejeitadas.
            </p>
            <div className="flex space-x-2">
              <Button onClick={startReconciliation} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Iniciar Reconciliação
              </Button>
              <Button onClick={() => setAnomalyMode(true)} className="bg-blue-600 hover:bg-blue-700">
                <Brain className="h-4 w-4 mr-2" />
                Ativar Modo IA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Reconciliation