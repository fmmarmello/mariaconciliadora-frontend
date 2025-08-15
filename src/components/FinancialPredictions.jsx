import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Target,
  AlertTriangle
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

const FinancialPredictions = () => {
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeframe, setTimeframe] = useState('12') // 6, 12, or 24 months

  useEffect(() => {
    fetchPredictions()
  }, [timeframe])

  const fetchPredictions = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/ai/predictions?periods=${timeframe}`)
      const data = await response.json()
      
      if (data.success) {
        setPredictions(data.data)
      } else {
        setError(data.error || 'Erro ao carregar previsões')
      }
    } catch (err) {
      setError('Erro de conexão. Verifique se o servidor está rodando.')
    } finally {
      setLoading(false)
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
      {/* Controles */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Previsões Financeiras</h2>
        <div className="flex space-x-2">
          <Button 
            variant={timeframe === '6' ? 'default' : 'outline'} 
            onClick={() => setTimeframe('6')}
          >
            6 meses
          </Button>
          <Button 
            variant={timeframe === '12' ? 'default' : 'outline'} 
            onClick={() => setTimeframe('12')}
          >
            12 meses
          </Button>
          <Button 
            variant={timeframe === '24' ? 'default' : 'outline'} 
            onClick={() => setTimeframe('24')}
          >
            24 meses
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {predictions && (
        <>
          {/* Resumo Histórico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Resumo Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Receitas Totais</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    R$ {predictions.historical_summary.total_income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {predictions.historical_summary.period_months} meses de dados
                  </p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">Despesas Totais</span>
                  </div>
                  <p className="text-2xl font-bold text-red-900 mt-1">
                    R$ {predictions.historical_summary.total_expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    {predictions.historical_summary.period_months} meses de dados
                  </p>
                </div>
                
                <div className={`${
                  predictions.historical_summary.net_flow >= 0 
                    ? 'bg-emerald-50' 
                    : 'bg-orange-50'
                } p-4 rounded-lg`}>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Saldo Líquido</span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    predictions.historical_summary.net_flow >= 0 
                      ? 'text-emerald-900' 
                      : 'text-orange-900'
                  } mt-1`}>
                    R$ {predictions.historical_summary.net_flow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Média mensal: R$ {(predictions.historical_summary.net_flow / predictions.historical_summary.period_months).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Previsões */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Previsões Financeiras
              </CardTitle>
              <CardDescription>
                Projeção de receitas, despesas e saldo líquido para os próximos {timeframe} meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={predictions.predictions}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                    labelFormatter={(value) => `Período: ${value}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted_income" 
                    stroke="#10B981" 
                    name="Receitas Previstas" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted_expenses" 
                    stroke="#EF4444" 
                    name="Despesas Previstas" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted_net_flow" 
                    stroke="#3B82F6" 
                    name="Saldo Líquido Previsto" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabela de Previsões */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Detalhamento Mensal
              </CardTitle>
              <CardDescription>
                Previsões detalhadas por mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Mês</th>
                      <th scope="col" className="px-6 py-3">Receitas Previstas</th>
                      <th scope="col" className="px-6 py-3">Despesas Previstas</th>
                      <th scope="col" className="px-6 py-3">Saldo Líquido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.predictions.map((prediction, index) => (
                      <tr key={index} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {prediction.date}
                        </td>
                        <td className="px-6 py-4 text-green-600">
                          R$ {prediction.predicted_income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-red-600">
                          R$ {prediction.predicted_expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`px-6 py-4 font-medium ${
                          prediction.predicted_net_flow >= 0 
                            ? 'text-emerald-600' 
                            : 'text-orange-600'
                        }`}>
                          R$ {prediction.predicted_net_flow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Alertas e Recomendações */}
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alertas e Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictions.predictions.some(p => p.predicted_net_flow < 0) && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Atenção:</strong> A previsão indica déficit em alguns meses. 
                      Considere revisar suas despesas ou buscar novas fontes de receita.
                    </AlertDescription>
                  </Alert>
                )}
                
                {predictions.historical_summary.net_flow > 0 && (
                  <Alert className="border-green-200 bg-green-50">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Positivo:</strong> Sua tendência histórica é positiva. 
                      Continue monitorando para manter esse desempenho.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default FinancialPredictions