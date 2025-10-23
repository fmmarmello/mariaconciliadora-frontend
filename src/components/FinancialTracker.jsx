import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.jsx'
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
  Building2,
  CheckCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import {
   LineChart,
   Line,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip as RechartsTooltip,
   ResponsiveContainer,
   PieChart as RechartsPieChart,
   Pie,
   Cell,
   Legend,
   BarChart,
   Bar
 } from 'recharts'
import { get, post, put, remove, ApiError } from '@/services/apiService.js'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog.jsx'
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentEntry, setCurrentEntry] = useState(null)
  const [formValues, setFormValues] = useState({
    date: '',
    description: '',
    amount: '',
    category: '',
    cost_center: '',
    department: '',
    project: '',
    transaction_type: 'expense',
    justificativa: ''
  })
  const [savingEntry, setSavingEntry] = useState(false)

  // Paleta de cores para os gráficos (alta legibilidade)
  const COLORS = [
    '#6366F1', // indigo
    '#22C55E', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#06B6D4', // cyan
    '#A855F7', // purple
    '#84CC16', // lime
    '#F97316', // orange
    '#14B8A6', // teal
    '#3B82F6'  // blue
  ]

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

  const openAddEntry = () => {
    setIsEditing(false)
    setCurrentEntry(null)
    setFormValues({
      date: '',
      description: '',
      amount: '',
      category: '',
      cost_center: '',
      department: '',
      project: '',
      transaction_type: 'expense',
      justificativa: ''
    })
    setShowEntryModal(true)
  }

  const openEditEntry = (entry) => {
    setIsEditing(true)
    setCurrentEntry(entry)
    setFormValues({
      date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : '',
      description: entry.description || '',
      amount: entry.amount != null ? entry.amount : '',
      category: entry.category || '',
      cost_center: entry.cost_center || '',
      department: entry.department || '',
      project: entry.project || '',
      transaction_type: entry.transaction_type || 'expense',
      justificativa: entry.justificativa || ''
    })
    setShowEntryModal(true)
  }

  const handleFormChange = (field, value) => {
    setFormValues(prev => ({ ...prev, [field]: value }))
  }

  const saveEntry = async () => {
    setSavingEntry(true)
    setError(null)
    try {
      const payload = { ...formValues }
      if (payload.amount !== '' && payload.amount !== null) {
        payload.amount = parseFloat(payload.amount)
      }

      if (isEditing && currentEntry?.id) {
        const res = await put(`api/company-financial/${currentEntry.id}`, payload)
        if (res && res.success && res.data) {
          setEntries(prev => prev.map(e => e.id === currentEntry.id ? res.data : e))
        }
      } else {
        const created = await post('api/company-financial', payload)
        if (created && created.success && created.data) {
          setEntries(prev => [created.data, ...prev])
        }
      }
      // Atualiza cards de resumo e dados após salvar
      fetchFinancialSummary()
      fetchFinancialData()
      setShowEntryModal(false)
    } catch (err) {
      if (err && err.message) setError(`Erro ao salvar entrada: ${err.message}`)
      console.error('Erro ao salvar entrada:', err)
    } finally {
      setSavingEntry(false)
    }
  }

  const handleDeleteEntry = async (entryId) => {
    setError(null)
    try {
      const res = await remove(`api/company-financial/${entryId}`)
      if (res && res.success) {
        setEntries(prev => prev.filter(e => e.id !== entryId))
        fetchFinancialSummary()
      }
    } catch (err) {
      if (err instanceof ApiError) {
        let detailed = err.message
        if (err.data && err.data.details && Array.isArray(err.data.details)) {
          detailed = err.data.details.join(', ')
        }
        setError(`Erro ao excluir entrada: ${detailed}`)
      } else {
        setError('Erro de conexão ao excluir entrada.')
      }
    }
  }
// Função para lidar com o salvamento das correções
  const handleCorrectionsSaved = () => {
    // Atualiza os dados após as correções serem salvas
    fetchFinancialData()
    fetchFinancialSummary()
    // Limpa o resultado do upload
    setUploadResult(null)
  }

  // Sorting functionality
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4" />
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  // Sort entries based on current sort config
  const sortedEntries = [...entries].sort((a, b) => {
    if (!sortConfig.key) return 0

    let aValue = a[sortConfig.key]
    let bValue = b[sortConfig.key]

    // Handle different data types
    if (sortConfig.key === 'amount') {
      aValue = Math.abs(aValue)
      bValue = Math.abs(bValue)
    } else if (sortConfig.key === 'date') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openAddEntry} className="bg-blue-600 hover:bg-blue-700">Adicionar Entrada</Button>
      </div>
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
                  <ResponsiveContainer width="100%" height={320}>
                    <RechartsPieChart>
                      {(() => {
                        // Prepara dados: valores absolutos, ordenados e com total
                        const data = (summary.categories || [])
                          .map(cat => ({ name: cat.name, value: Math.abs(cat.total) }))
                          .sort((a,b) => b.value - a.value)
                        const total = data.reduce((acc, d) => acc + d.value, 0)

                        // Rótulo customizado: mostra apenas fatias >= 5%
                        const renderLabel = ({ name, value, percent, cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                          if (!percent || percent < 0.05) return null
                          const RADIAN = Math.PI / 180
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                          const x = cx + radius * Math.cos(-midAngle * RADIAN)
                          const y = cy + radius * Math.sin(-midAngle * RADIAN)
                          const text = `${name} ${(percent * 100).toFixed(0)}%`
                          return (
                            <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 12, fontWeight: 600 }}>
                              {text}
                            </text>
                          )
                        }

                        return (
                          <>
                            <Pie
                              data={data}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={110}
                              dataKey="value"
                              labelLine={false}
                              label={renderLabel}
                              isAnimationActive={false}
                            >
                              {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            {/* Total no centro */}
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 14, fontWeight: 600, fill: '#111827' }}>
                              Total
                            </text>
                            <text x="50%" y="50%" dy={18} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 12, fill: '#6B7280' }}>
                              {`R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                            </text>
                            <Legend
                              layout="horizontal"
                              verticalAlign="bottom"
                              align="center"
                              iconType="circle"
                              wrapperStyle={{ fontSize: 12, marginTop: 8 }}
                              formatter={(value) => <span style={{ color: '#374151' }}>{value}</span>}
                            />
                            <RechartsTooltip
                              formatter={(value, name, props) => [
                                `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                                name
                              ]}
                              labelFormatter={() => 'Categoria'}
                              contentStyle={{ borderRadius: 8, borderColor: '#E5E7EB' }}
                            />
                          </>
                        )
                      })()}
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
              Lista de despesas e receitas da empresa • {entries.length} entradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('date')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Data
                        {getSortIcon('date')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('description')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Descrição
                        {getSortIcon('description')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('category')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Categoria
                        {getSortIcon('category')}
                      </Button>
                    </TableHead>
                    <TableHead>Centro de Custo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('amount')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Valor
                        {getSortIcon('amount')}
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEntries.map((entry, index) => (
                    <TableRow key={entry.id || index}>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-2 cursor-help">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {new Date(entry.date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Data da transação financeira</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium text-sm truncate" title={entry.description}>
                            {entry.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {entry.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {entry.cost_center || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {entry.department || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`font-bold ${entry.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.transaction_type === 'income' ? '+' : ''}R$ {Math.abs(entry.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(entry.is_reconciled === true || (entry.justificativa && String(entry.justificativa).trim() !== '')) ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 cursor-help">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Encontrado
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Esta entrada foi reconciliada ou possui justificativa</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditEntry(entry)}>
                            Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700">
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta entrada? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)} className="bg-red-600 hover:bg-red-700">
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
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

      <Dialog open={showEntryModal} onOpenChange={setShowEntryModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Entrada' : 'Adicionar Entrada'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Atualize os dados da entrada financeira.' : 'Informe os dados da nova entrada financeira.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={formValues.date} onChange={(e) => handleFormChange('date', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formValues.transaction_type} onValueChange={(v) => handleFormChange('transaction_type', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Descrição</Label>
              <Input value={formValues.description} onChange={(e) => handleFormChange('description', e.target.value)} placeholder="Descrição" />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input value={formValues.category} onChange={(e) => handleFormChange('category', e.target.value)} placeholder="Categoria" />
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input type="number" step="0.01" value={formValues.amount} onChange={(e) => handleFormChange('amount', e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Centro de Custo</Label>
              <Input value={formValues.cost_center} onChange={(e) => handleFormChange('cost_center', e.target.value)} placeholder="Centro de custo" />
            </div>
            <div className="space-y-2">
              <Label>Departamento</Label>
              <Input value={formValues.department} onChange={(e) => handleFormChange('department', e.target.value)} placeholder="Departamento" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Projeto</Label>
              <Input value={formValues.project} onChange={(e) => handleFormChange('project', e.target.value)} placeholder="Projeto" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Justificativa (opcional)</Label>
              <Textarea value={formValues.justificativa} onChange={(e) => handleFormChange('justificativa', e.target.value)} placeholder="Explique o ajuste, se necessário" />
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEntryModal(false)}>Cancelar</Button>
            <Button onClick={saveEntry} disabled={savingEntry} className="bg-green-600 hover:bg-green-700">
              {savingEntry ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FinancialTracker
