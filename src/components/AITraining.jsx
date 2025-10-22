import { useState } from 'react'
import { post, ApiError } from '@/services/apiService';
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  Brain, 
  Sparkles,
  Play,
  BarChart3,
  Target,
  Calendar
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

const AITraining = () => {
  const [trainingStatus, setTrainingStatus] = useState('idle') // 'idle', 'training', 'completed', 'error'
  const [trainingResult, setTrainingResult] = useState(null)
  const [error, setError] = useState(null)
  const [accuracy, setAccuracy] = useState(0)

  const startTraining = async () => {
    setError(null)
    setTrainingStatus('training')
    setAccuracy(0)

    try {
      // Simula o progresso do treinamento
      const progressInterval = setInterval(() => {
        setAccuracy(prev => {
          const newAccuracy = prev + 10
          if (newAccuracy >= 85) {
            clearInterval(progressInterval)
            return 85
          }
          return newAccuracy
        })
      }, 500)

      // Chama a API para treinar o modelo
      const data = await post('api/ai/train');
      clearInterval(progressInterval);
      
      if (data.success) {
        setTrainingStatus('completed');
        setTrainingResult(data);
        setAccuracy(data.accuracy * 100);
      } else {
        setTrainingStatus('error');
        setError(data.error || 'Erro ao treinar modelo');
      }
    } catch (error) {
      setTrainingStatus('error');
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Erro de conexão. Verifique se o servidor está rodando.');
      }
    }
  }

  const categorizeTest = async () => {
    try {
      const data = await post('api/ai/categorize-financial', {
        description: 'Pagamento de fornecedor para compra de materiais'
      });

      if (data.success) {
        alert(`Categoria sugerida: ${data.data.category}`);
      } else {
        setError(data.error || 'Erro ao categorizar');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Erro de conexão. Verifique se o servidor está rodando.');
      }
    }
  }

  // Derived metrics for charts
  const categoryAccuracy = trainingResult?.metrics?.category_accuracy || null
  const categoryAccuracyData = categoryAccuracy
    ? Object.entries(categoryAccuracy).map(([name, val]) => ({ name, accuracy: Math.round((val || 0) * 100) }))
    : [
        { name: 'Treinado', accuracy: Math.round(accuracy) || 0 }
      ]

  const trainingTimeMs = trainingResult?.metrics?.training_time_ms
  const timeData = trainingTimeMs != null
    ? [{ name: 'Treinamento', time: Math.max(1, Math.round(trainingTimeMs)) }]
    : [
        { name: 'Treinamento', time: 0 }
      ]

  return (
    <div className="space-y-6">
      {/* Treinamento do Modelo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Treinamento do Modelo de IA
          </CardTitle>
          <CardDescription>
            Treine a IA com seus dados financeiros para melhor categorização
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trainingStatus === 'idle' && (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Modelo não treinado</h3>
              <p className="text-gray-500 text-center mb-4">
                Treine a IA com seus dados financeiros para obter categorizações mais precisas.
              </p>
              <Button onClick={startTraining}>
                <Play className="h-4 w-4 mr-2" />
                Iniciar Treinamento
              </Button>
            </div>
          )}

          {trainingStatus === 'training' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Treinando modelo...</h3>
                <p className="text-gray-500">Analisando dados financeiros e criando categorizações personalizadas</p>
              </div>
              <Progress value={accuracy} className="w-full" />
              <p className="text-center text-sm text-gray-500">{Math.round(accuracy)}% concluído</p>
            </div>
          )}

          {trainingStatus === 'completed' && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <Sparkles className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p className="font-medium">Modelo treinado com sucesso!</p>
                    <div className="text-sm space-y-1">
                      <p>• Acurácia: {Math.round((trainingResult.accuracy || 0) * 100)}%</p>
                      {trainingResult.categories_count != null && (
                        <p>• Categorias: {trainingResult.categories_count}</p>
                      )}
                      {trainingResult.training_data_count != null && (
                        <p>• Amostras de treino: {trainingResult.training_data_count}</p>
                      )}
                      {trainingResult.metrics?.training_time_ms != null && (
                        <p>• Tempo de treinamento: {Math.round(trainingResult.metrics.training_time_ms)} ms</p>
                      )}
                      <p>• Modelo personalizado ativo</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center space-x-4">
                <Button onClick={startTraining} variant="outline">
                  Treinar Novamente
                </Button>
                <Button onClick={categorizeTest}>
                  Testar Categorização
                </Button>
              </div>
            </div>
          )}

          {trainingStatus === 'error' && (
            <Alert variant="destructive">
              <Sparkles className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Métricas de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Métricas de Performance
          </CardTitle>
          <CardDescription>
            Comparação entre IA padrão e modelo treinado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Acurácia por Categoria</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryAccuracyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Tempo de Treinamento (ms)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="time" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Recomendações para Melhor Treinamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Dados Históricos</h4>
                <p className="text-sm text-gray-500">Use pelo menos 6 meses de dados para um treinamento eficaz</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Target className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Categorização Manual</h4>
                <p className="text-sm text-gray-500">Revise e corrija categorizações antes do treinamento</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Atualização Regular</h4>
                <p className="text-sm text-gray-500">Reforce o treinamento mensalmente com novos dados</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AITraining
