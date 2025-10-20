import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Filter,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ArrowUp,
  Search,
  Calendar,
  User
} from 'lucide-react'
import { anomalyDetectionService } from '@/services/anomalyDetectionService.js'

const AnomalyManagement = () => {
  const [anomalies, setAnomalies] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    limit: 20,
    offset: 0
  })
  const [selectedAnomaly, setSelectedAnomaly] = useState(null)
  const [suggestions, setSuggestions] = useState(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)

  useEffect(() => {
    fetchAnomalies()
    fetchStatistics()
  }, [filters])

  const fetchAnomalies = async () => {
    try {
      setLoading(true)
      const data = await anomalyDetectionService.getAnomalousReconciliations(filters)
      setAnomalies(data.data?.anomalies || [])
    } catch (err) {
      setError('Erro ao carregar anomalias: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const data = await anomalyDetectionService.getAnomalyStatistics()
      setStatistics(data.data)
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }))
  }

  const handleReviewAnomaly = async (anomaly) => {
    setSelectedAnomaly(anomaly)
    setShowReviewDialog(true)
    
    // Buscar sugestões de IA
    try {
      const suggestionsData = await anomalyDetectionService.getAnomalyWorkflowSuggestions(anomaly.id)
      setSuggestions(suggestionsData.data)
    } catch (err) {
      console.error('Erro ao buscar sugestões:', err)
    }
  }

  const handleAnomalyAction = async (anomalyId, action, justification = '') => {
    setProcessing(true)
    try {
      const reviewData = {
        user_id: 1, // TODO: Get from auth context
        action,
        justification
      }
      
      await anomalyDetectionService.reviewAnomaly(anomalyId, reviewData)
      
      // Atualizar lista e estatísticas
      await fetchAnomalies()
      await fetchStatistics()
      
      setShowReviewDialog(false)
      setSelectedAnomaly(null)
      setSuggestions(null)
    } catch (err) {
      setError('Erro ao processar ação: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleEscalateAnomaly = async (anomalyId, reason) => {
    setProcessing(true)
    try {
      const escalationData = {
        user_id: 1, // TODO: Get from auth context
        escalation_reason: reason
      }
      
      await anomalyDetectionService.escalateAnomaly(anomalyId, escalationData)
      
      // Atualizar lista
      await fetchAnomalies()
      setShowReviewDialog(false)
    } catch (err) {
      setError('Erro ao escalonar anomalia: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  const getSeverityBadge = (severity) => {
    const colors = anomalyDetectionService.getSeverityColor(severity)
    const text = anomalyDetectionService.getSeverityText(severity)
    return (
      <Badge className={colors}>
        {text}
      </Badge>
    )
  }

  const getStatusBadge = (status) => {
    const colors = anomalyDetectionService.getStatusColor(status)
    const text = status === 'pending' ? 'Pendente' : 
                 status === 'resolved' ? 'Resolvido' : 
                 status === 'escalated' ? 'Escalonado' : status
    return (
      <Badge className={colors}>
        {text}
      </Badge>
    )
  }

  const getAnomalyIcon = (type) => {
    const iconName = anomalyDetectionService.getAnomalyIcon(type)
    // You would need to import the actual icon components
    return <AlertTriangle className="h-4 w-4" />
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
      {/* Estatísticas */}
      {statistics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Estatísticas de Anomalias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-900">{statistics.total_anomalies || 0}</div>
                <div className="text-sm text-red-700">Total de Anomalias</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-900">{statistics.pending_count || 0}</div>
                <div className="text-sm text-yellow-700">Pendentes</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-900">{statistics.resolved_count || 0}</div>
                <div className="text-sm text-green-700">Resolvidas</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-900">{Math.round((statistics.resolution_rate || 0) * 100)}%</div>
                <div className="text-sm text-purple-700">Taxa de Resolução</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Severidade</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
              >
                <option value="">Todas</option>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="pending">Pendente</option>
                <option value="resolved">Resolvido</option>
                <option value="escalated">Escalonado</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={fetchAnomalies} 
                disabled={loading}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Lista de Anomalias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Anomalias Detectadas
          </CardTitle>
          <CardDescription>
            {anomalies.length} anomalias encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {anomalies.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma anomalia encontrada</h3>
              <p className="text-gray-500">Todas as transações foram reconciliadas com sucesso.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {anomalies.map((anomaly) => (
                <div key={anomaly.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      {getAnomalyIcon(anomaly.anomaly_type)}
                      <span className="font-medium">
                        {anomalyDetectionService.getAnomalyTypeText(anomaly.anomaly_type)}
                      </span>
                      {getSeverityBadge(anomaly.severity)}
                      {getStatusBadge(anomaly.status)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        Score: {anomalyDetectionService.formatAnomalyScore(anomaly.anomaly_score)}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReviewAnomaly(anomaly)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Transação Bancária</h4>
                      <p className="text-sm text-gray-600">
                        {anomaly.bank_transaction?.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {anomaly.bank_transaction?.bank_name} • {new Date(anomaly.bank_transaction?.date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        R$ {Math.abs(anomaly.bank_transaction?.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-1">Entrada Financeira</h4>
                      <p className="text-sm text-gray-600">
                        {anomaly.company_entry?.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {anomaly.company_entry?.category} • {new Date(anomaly.company_entry?.date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        R$ {Math.abs(anomaly.company_entry?.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {anomaly.anomaly_details && (
                    <div className="mt-3 p-3 bg-red-50 rounded-md">
                      <p className="text-sm text-red-800">
                        <strong>Detalhes:</strong> {anomaly.anomaly_details}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex justify-end space-x-2">
                    {anomaly.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAnomalyAction(anomaly.id, 'confirmed', 'Anomalia confirmada após análise')}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleAnomalyAction(anomaly.id, 'dismissed', 'Anomalia descartada após análise')}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEscalateAnomaly(anomaly.id, 'Requer análise especializada')}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Revisão */}
      {showReviewDialog && selectedAnomaly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Revisar Anomalia</CardTitle>
              <CardDescription>
                ID: {selectedAnomaly.id} • {anomalyDetectionService.getAnomalyTypeText(selectedAnomaly.anomaly_type)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Detalhes da anomalia */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Transação Bancária</h4>
                    <p className="text-sm text-gray-600">
                      {selectedAnomaly.bank_transaction?.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedAnomaly.bank_transaction?.bank_name} • {new Date(selectedAnomaly.bank_transaction?.date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      R$ {Math.abs(selectedAnomaly.bank_transaction?.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-1">Entrada Financeira</h4>
                    <p className="text-sm text-gray-600">
                      {selectedAnomaly.company_entry?.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedAnomaly.company_entry?.category} • {new Date(selectedAnomaly.company_entry?.date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      R$ {Math.abs(selectedAnomaly.company_entry?.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Sugestões de IA */}
                {suggestions && (
                  <div className="p-3 bg-blue-50 rounded-md">
                    <h4 className="font-medium text-sm mb-2">Sugestões de IA</h4>
                    <p className="text-sm text-blue-800">{suggestions.suggested_action}</p>
                    {suggestions.confidence && (
                      <p className="text-xs text-blue-600 mt-1">
                        Confiança: {Math.round(suggestions.confidence * 100)}%
                      </p>
                    )}
                  </div>
                )}

                {/* Ações */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowReviewDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleAnomalyAction(selectedAnomaly.id, 'dismissed', 'Anomalia descartada após análise detalhada')}
                    disabled={processing}
                  >
                    Descartar
                  </Button>
                  <Button 
                    onClick={() => handleAnomalyAction(selectedAnomaly.id, 'confirmed', 'Anomalia confirmada após análise detalhada')}
                    disabled={processing}
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AnomalyManagement