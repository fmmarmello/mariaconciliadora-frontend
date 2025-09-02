import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  Upload, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  PieChart, 
  BarChart3,
  AlertTriangle,
  FileText,
  Brain,
  Sparkles,
  Calendar,
  Building2
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import { get, post, ApiError } from '@/services/apiService.js'
import FinancialTrackerCorrections from './FinancialTrackerCorrections.jsx'

const FinancialTracker = () => {
  const [entries, setEntries] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Cores para os gráficos
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0']

  useEffect(() => {
    fetchFinancialData()
    fetchFinancialSummary()
  }, [])

  const fetchFinancialData = async () => {
    try {
      const data = await get('api/company-financial', { limit: 50 })
      if (data.success) {
        setEntries(data.data.entries)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        let detailedError = error.message; // Fallback to the original message
        if (error.data && error.data.details && Array.isArray(error.data.details)) {
          detailedError = error.data.details.join(', ');
        } else if (error.data && error.data.error) {
          detailedError = error.data.error;
        }
        setError(`Erro ao buscar dados financeiros: ${detailedError}`);
      } else {
        setError('Erro de conexão ao buscar dados financeiros.');
      }
      console.error('Erro ao buscar dados financeiros:', error);
    }
  }

  const fetchFinancialSummary = async () => {
    try {
      const data = await get('api/company-financial/summary')
      if (data.success) {
        setSummary(data.data)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        let detailedError = error.message;
        if (error.data && error.data.details && Array.isArray(error.data.details)) {
          detailedError = error.data.details.join(', ');
        } else if (error.data && error.data.error) {
          detailedError = error.data.error;
        }
        setError(`Erro ao buscar resumo financeiro: ${detailedError}`);
      } else {
        setError('Erro de conexão ao buscar resumo financeiro.');
      }
      console.error('Erro ao buscar resumo financeiro:', error);
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file) => {
    setError(null)
    setUploadResult(null)

    // Validações
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setError('Apenas arquivos .xlsx são suportados.')
      return
    }

    if (file.size > 16 * 1024 * 1024) { // 16MB
      setError('Arquivo muito grande. Tamanho máximo: 16MB.')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const data = await post('api/upload-xlsx', formData, { 'Content-Type': undefined })

      if (data.success) {
        setUploadResult(data)
        // Se houver entradas incompletas, mantém o resultado para exibição
        if (data.data.items_incomplete > 0) {
          setUploadResult(data)
        } else {
          // Caso contrário, limpa o resultado e atualiza os dados
          setUploadResult(null)
          fetchFinancialData()
          fetchFinancialSummary()
        }
      } else {
        setError(data.error || 'Erro ao processar arquivo')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        let detailedError = error.message;
        if (error.data && error.data.details && Array.isArray(error.data.details)) {
          detailedError = error.data.details.join(', ');
        } else if (error.data && error.data.error) {
          detailedError = error.data.error;
        }
        setError(detailedError);
      } else {
        setError('Erro de conexão. Verifique se o servidor está rodando.');
      }
    } finally {
      setUploading(false)
    }
  }

  const openFileDialog = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.xlsx'
    fileInput.onchange = handleFileInput
    fileInput.click()
  }
// Função para lidar com o salvamento das correções
  const handleCorrectionsSaved = () => {
    // Atualiza os dados após as correções serem salvas
    fetchFinancialData()
    fetchFinancialSummary()
    // Limpa o resultado do upload
    setUploadResult(null)
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
      {/* Visão Geral */}
      {summary && (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
                <TrendingUp className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {summary.overview?.total_income?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
                <TrendingDown className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {summary.overview?.total_expenses?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-r ${
              (summary.overview?.net_flow || 0) >= 0
                ? 'from-emerald-500 to-emerald-600'
                : 'from-orange-500 to-orange-600'
            } text-white`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
                <DollarSign className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {summary.overview?.net_flow?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entradas</CardTitle>
                <CreditCard className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.overview?.total_entries || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Categorias */}
            {summary.categories && summary.categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Gastos por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={summary.categories.map(cat => ({
                          name: cat.name,
                          value: Math.abs(cat.total)
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {summary.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Últimas Entradas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Últimas Entradas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary.recent_entries && summary.recent_entries.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{entry.description}</p>
                        <p className="text-xs text-gray-500">
                          {entry.category} • {new Date(entry.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className={`font-bold ${entry.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {entry.transaction_type === 'income' ? '+' : ''}R$ {Math.abs(entry.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Área de Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload de Arquivo XLSX
          </CardTitle>
          <CardDescription>
            Arraste e solte seu arquivo XLSX aqui ou clique para selecionar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <div>
                  <p className="text-lg font-medium text-gray-900">Processando arquivo...</p>
                  <p className="text-sm text-gray-500">Importando dados financeiros</p>
                </div>
                <Progress value={75} className="w-full max-w-xs mx-auto" />
              </div>
            ) : (
              <div className="space-y-4">
                <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Selecione um arquivo XLSX
                  </p>
                  <p className="text-sm text-gray-500">
                    Formatos suportados: .xlsx (máx. 16MB)
                  </p>
                </div>
                <Button onClick={openFileDialog} disabled={uploading}>
                  Selecionar Arquivo
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultado do Upload */}
      {uploadResult && (
        <Alert className="border-green-200 bg-green-50">
          <Sparkles className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p className="font-medium">{uploadResult.message}</p>
              <div className="text-sm space-y-1">
                <p>• Itens importados: {uploadResult.data.items_imported}</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Lista de Entradas */}
      {entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Entradas Financeiras
            </CardTitle>
            <CardDescription>
              Lista de despesas e receitas da empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{entry.description}</p>
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      <span>{entry.category}</span>
                      <span>•</span>
                      <span>{entry.cost_center || 'Sem centro de custo'}</span>
                      <span>•</span>
                      <span>{entry.department || 'Sem departamento'}</span>
                      <span>•</span>
                      <span>{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className={`font-bold ${entry.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.transaction_type === 'income' ? '+' : ''}R$ {Math.abs(entry.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Componente de Correção */}
      {uploadResult && uploadResult.data.items_incomplete > 0 && (
        <FinancialTrackerCorrections
          incompleteEntries={uploadResult.data.incomplete_items}
          onCorrectionsSaved={handleCorrectionsSaved}
        />
      )}
    </div>
  )
}

export default FinancialTracker