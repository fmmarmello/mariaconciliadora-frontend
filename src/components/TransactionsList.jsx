import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog.jsx'
import API_CONFIG from '@/config/api.js'
import { get, put, remove, ApiError } from '@/services/apiService.js'
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Building2,
  Tag,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Trash2,
  MoreHorizontal
} from 'lucide-react'

const TransactionsList = ({ transactions: initialTransactions }) => {
  const [transactions, setTransactions] = useState(initialTransactions || [])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [viewingTransaction, setViewingTransaction] = useState(null)
  // Server pagination tracking (for non-search views)
  const [apiPage, setApiPage] = useState(0)
  const [apiTotalPages, setApiTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    bank: 'all',
    category: 'all',
    type: 'all',
    startDate: '',
    endDate: ''
  })

  const itemsPerPage = 20

  useEffect(() => {
    if (initialTransactions) {
      setTransactions(initialTransactions)
    } else {
      fetchTransactions('reset')
    }
  }, [initialTransactions])

  // Refetch from server when filters change (debounced)
  useEffect(() => {
    if (initialTransactions) return
    const handle = setTimeout(() => {
      // Reset aggregation when filters change
      setApiPage(0)
      setApiTotalPages(1)
      fetchTransactions('reset')
    }, 300)
    return () => clearTimeout(handle)
  }, [filters.bank, filters.category, filters.type, filters.startDate, filters.endDate])

  useEffect(() => {
    applyFilters()
  }, [transactions, filters, sortConfig])

  // Generic, type-aware comparator for sorting
  const compareByKey = (a, b, key, direction = 'asc') => {
    let aValue = a?.[key]
    let bValue = b?.[key]

    // Normalize undefined/null
    const dir = direction === 'asc' ? 1 : -1
    const isNilA = aValue === undefined || aValue === null || aValue === ''
    const isNilB = bValue === undefined || bValue === null || bValue === ''
    if (isNilA && isNilB) return 0
    if (isNilA) return 1 * dir // push empty values to the end
    if (isNilB) return -1 * dir

    // Custom numeric handling
    if (key === 'amount') {
      const na = Math.abs(Number(aValue))
      const nb = Math.abs(Number(bValue))
      if (na < nb) return -1 * dir
      if (na > nb) return 1 * dir
      return 0
    }

    // Dates: accept Date objects or ISO/date strings
    if (key === 'date' || key === 'created_at' || key === 'timestamp') {
      const ta = (aValue instanceof Date) ? aValue.getTime() : Date.parse(String(aValue))
      const tb = (bValue instanceof Date) ? bValue.getTime() : Date.parse(String(bValue))
      const aIsNaN = Number.isNaN(ta)
      const bIsNaN = Number.isNaN(tb)
      if (aIsNaN && bIsNaN) return 0
      if (aIsNaN) return 1 * dir
      if (bIsNaN) return -1 * dir
      if (ta < tb) return -1 * dir
      if (ta > tb) return 1 * dir
      return 0
    }

    // Plain numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      if (aValue < bValue) return -1 * dir
      if (aValue > bValue) return 1 * dir
      return 0
    }

    // Strings (case-insensitive + numeric aware)
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue, undefined, { sensitivity: 'base', numeric: true }) * dir
    }

    // Fallback: coerce to string and compare
    const sa = String(aValue)
    const sb = String(bValue)
    return sa.localeCompare(sb, undefined, { sensitivity: 'base', numeric: true }) * dir
  }

  const fetchTransactions = async (mode = 'reset') => {
    setLoading(true)
    try {
      const fetchAll = true
      const queryParams = new URLSearchParams()
      // Page to fetch
      const nextPage = fetchAll ? 1 : (mode === 'append' ? (apiPage + 1) : 1)
      queryParams.set('page', String(nextPage))
      // Increase page size for searches to reduce hops
      const hasSearch = !!(filters.search && filters.search.trim())
      if (fetchAll) {
        queryParams.set('limit', 'all')
      } else {
        queryParams.set('limit', hasSearch ? '1000' : '100')
      }

      // Server-side filters
      if (hasSearch) {
        const term = filters.search.trim()
        queryParams.set('q', term)
        // Also search in category text
        queryParams.set('category_q', term)
      }
      if (filters.bank && filters.bank !== 'all') {
        queryParams.set('bank', filters.bank)
      }
      if (filters.category && filters.category !== 'all') {
        queryParams.set('category', filters.category)
      }
      if (filters.type && filters.type !== 'all') {
        queryParams.set('type', filters.type)
      }
      if (filters.startDate) {
        queryParams.set('start_date', filters.startDate)
      }
      if (filters.endDate) {
        queryParams.set('end_date', filters.endDate)
      }

      // Convert URLSearchParams into a plain object so apiService can append them correctly
      const data = await get('api/transactions', Object.fromEntries(queryParams))
      if (data.success) {
        const list = data.data.transactions || []
        const totalPages = data.data.total_pages || 1
        if (mode === 'append' && !fetchAll) {
          setTransactions(prev => [...prev, ...list])
        } else {
          setTransactions(list)
        }
        setApiPage(nextPage)
        setApiTotalPages(totalPages)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Erro na API ao buscar transações:', error.message, error.status, error.data)
      } else {
        console.error('Erro ao buscar transações:', error)
      }
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Filtro de busca: quando usamos server-side q, não precisamos refiltrar por descrição.
    // Mantemos como no-op para não reduzir indevidamente resultados já filtrados no servidor.
    // if (filters.search) {
    //   filtered = filtered.filter(t =>
    //     t.description.toLowerCase().includes(filters.search.toLowerCase())
    //   )
    // }

    // Busca local quando transações vêm por props
    const isPropDriven = false && !!initialTransactions
    if (isPropDriven && filters.search && filters.search.trim()) {
      const term = filters.search.trim().toLowerCase()
      filtered = filtered.filter(t => {
        const desc = (t.description || '').toLowerCase()
        const cat = (t.category || '').toLowerCase()
        return desc.includes(term) || cat.includes(term)
      })
    }

    // Filtro por banco
    if (filters.bank && filters.bank !== 'all') {
      filtered = filtered.filter(t => t.bank_name === filters.bank)
    }

    // Filtro por categoria
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category)
    }

    // Filtro por tipo
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(t => t.transaction_type === filters.type)
    }

    // Filtro por data
    if (filters.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate))
    }
    if (filters.endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate))
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => compareByKey(a, b, sortConfig.key, sortConfig.direction))
    }

    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }

  // Dispara busca no backend com o termo digitado
  const handleServerSearch = () => {
    setApiPage(0)
    setApiTotalPages(1)
    fetchTransactions('reset')
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      bank: '',
      category: '',
      type: '',
      startDate: '',
      endDate: ''
    })
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

  // Row selection functionality
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredTransactions.map(t => t.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (transactionId, checked) => {
    if (checked) {
      setSelectedRows(prev => [...prev, transactionId])
    } else {
      setSelectedRows(prev => prev.filter(id => id !== transactionId))
    }
  }

  const isAllSelected = filteredTransactions.length > 0 && selectedRows.length === filteredTransactions.length
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < filteredTransactions.length

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return

    try {
      const res = await remove('api/transactions/bulk', { ids: selectedRows })
      if (res && res.success) {
        // Remove deleted transactions from local state
        setTransactions(prev => prev.filter(t => !selectedRows.includes(t.id)))
        setSelectedRows([])
      }
    } catch (error) {
      console.error('Erro ao excluir transações:', error instanceof ApiError ? error.message : error)
    }
  }

  // View transaction details
  const handleViewTransaction = (transaction) => {
    setViewingTransaction(transaction)
  }

  const startEdit = (tx) => {
    setEditingId(tx.id)
    setEditValues({
      date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : '',
      amount: tx.amount,
      description: tx.description || '',
      category: tx.category || '',
      transaction_type: tx.transaction_type || 'debit',
      is_anomaly: false,
      justificativa: tx.justificativa || ''
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValues({})
  }

  const handleEditChange = (field, value) => {
    setEditValues(prev => ({ ...prev, [field]: value }))
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    try {
      const payload = { ...editValues }
      const res = await put(`api/transactions/${editingId}`, payload)
      if (res && res.success && res.data) {
        // Update local state
        setTransactions(prev => prev.map(t => t.id === editingId ? res.data : t))
        cancelEdit()
      }
    } catch (err) {
      console.error('Erro ao salvar ajuste:', err instanceof ApiError ? err.message : err)
    } finally {
      setSaving(false)
    }
  }

  // Paginação
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

  // Obter listas únicas para os filtros
  const uniqueBanks = [...new Set(transactions.map(t => t.bank_name))].filter(Boolean)
  const uniqueCategories = [...new Set(transactions.map(t => t.category))].filter(Boolean)

  const getCategoryColor = (category) => {
    const colors = {
      'alimentacao': 'bg-orange-100 text-orange-800',
      'transporte': 'bg-blue-100 text-blue-800',
      'saude': 'bg-red-100 text-red-800',
      'educacao': 'bg-purple-100 text-purple-800',
      'lazer': 'bg-pink-100 text-pink-800',
      'servicos': 'bg-green-100 text-green-800',
      'Juros/Multa': 'bg-rose-100 text-rose-800',
      'vestuario': 'bg-yellow-100 text-yellow-800',
      'investimento': 'bg-indigo-100 text-indigo-800',
      'transferencia': 'bg-gray-100 text-gray-800',
      'saque': 'bg-slate-100 text-slate-800',
      'salario': 'bg-emerald-100 text-emerald-800',
      'outros': 'bg-neutral-100 text-neutral-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6" data-testid="transactions-list">
      {/* Filtros */}
      <Card data-testid="transactions-filters">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
          <CardDescription>
            Filtre suas transações para encontrar o que procura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por descrição..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleServerSearch() }}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
              {/* Botão Buscar movido para ao lado de "Limpar Filtros" no rodapé dos filtros */}
            </div>

            {/* Banco */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Banco</label>
              <Select value={filters.bank} onValueChange={(value) => handleFilterChange('bank', value)}>
                <SelectTrigger data-testid="bank-select">
                  <SelectValue placeholder="Todos os bancos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os bancos</SelectItem>
                  {uniqueBanks.map(bank => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger data-testid="category-select">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger data-testid="type-select">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="credit">Receitas</SelectItem>
                  <SelectItem value="debit">Gastos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data Inicial */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                data-testid="start-date-input"
              />
            </div>

            {/* Data Final */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                data-testid="end-date-input"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              {filteredTransactions.length} transação(ões) encontrada(s)
            </p>
            <div className="flex gap-2">
              {selectedRows.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Selecionadas ({selectedRows.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir {selectedRows.length} transação(ões) selecionada(s)?
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button onClick={handleServerSearch} disabled={loading} data-testid="search-button">
                Buscar
              </Button>
              <Button variant="outline" onClick={clearFilters} data-testid="clear-filters-button">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card data-testid="transactions-table-card">
        <CardHeader>
          <CardTitle>Transações</CardTitle>
          <CardDescription>
            Página {currentPage} de {totalPages} • {selectedRows.length} selecionada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8" data-testid="loading-spinner">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : currentTransactions.length > 0 ? (
            <div className="space-y-4">
              <Table data-testid="transactions-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Selecionar todas"
                      />
                    </TableHead>
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
                        onClick={() => handleSort('bank_name')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Banco
                        {getSortIcon('bank_name')}
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
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTransactions.map((transaction) => (
                    <TableRow key={transaction.id || transaction.description}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(transaction.id)}
                          onCheckedChange={(checked) => handleSelectRow(transaction.id, checked)}
                          aria-label={`Selecionar ${transaction.description}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{transaction.description}</span>
                            {transaction.is_anomaly && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Anomalia
                              </Badge>
                            )}
                            {(
                              (transaction.is_reconciled === true) ||
                              (!transaction.is_anomaly && transaction.justificativa && String(transaction.justificativa).trim() !== '')
                            ) && (
                              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Encontrado
                              </Badge>
                            )}
                          </div>
                          {editingId === transaction.id && (
                            <div className="mt-2 p-2 bg-gray-50 rounded border text-xs">
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  type="date"
                                  value={editValues.date || ''}
                                  onChange={(e) => handleEditChange('date', e.target.value)}
                                  placeholder="Data"
                                />
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editValues.amount ?? ''}
                                  onChange={(e) => handleEditChange('amount', parseFloat(e.target.value) || 0)}
                                  placeholder="Valor"
                                />
                                <Input
                                  value={editValues.description || ''}
                                  onChange={(e) => handleEditChange('description', e.target.value)}
                                  placeholder="Descrição"
                                />
                                <Input
                                  value={editValues.category || ''}
                                  onChange={(e) => handleEditChange('category', e.target.value)}
                                  placeholder="Categoria"
                                />
                              </div>
                              <div className="flex gap-1 justify-end mt-2">
                                <Button size="sm" variant="outline" onClick={cancelEdit}>Cancelar</Button>
                                <Button size="sm" onClick={saveEdit} disabled={saving}>
                                  {saving ? 'Salvando...' : 'Salvar'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{transaction.bank_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.category && (
                          <Badge variant="secondary" className={`text-xs ${getCategoryColor(transaction.category)}`}>
                            <Tag className="h-3 w-3 mr-1" />
                            {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`flex items-center justify-end font-bold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          {transaction.amount > 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewTransaction(transaction)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalhes da Transação</DialogTitle>
                                <DialogDescription>
                                  Informações completas sobre esta transação
                                </DialogDescription>
                              </DialogHeader>
                              {viewingTransaction && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Data</label>
                                      <p className="text-sm text-gray-600">
                                        {new Date(viewingTransaction.date).toLocaleDateString('pt-BR')}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Valor</label>
                                      <p className={`text-sm font-bold ${
                                        viewingTransaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        R$ {Math.abs(viewingTransaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Banco</label>
                                      <p className="text-sm text-gray-600">{viewingTransaction.bank_name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Tipo</label>
                                      <p className="text-sm text-gray-600">
                                        {viewingTransaction.transaction_type === 'credit' ? 'Receita' : 'Gasto'}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Descrição</label>
                                    <p className="text-sm text-gray-600">{viewingTransaction.description}</p>
                                  </div>
                                  {viewingTransaction.category && (
                                    <div>
                                      <label className="text-sm font-medium">Categoria</label>
                                      <p className="text-sm text-gray-600">{viewingTransaction.category}</p>
                                    </div>
                                  )}
                                  {viewingTransaction.justificativa && (
                                    <div>
                                      <label className="text-sm font-medium">Justificativa</label>
                                      <p className="text-sm text-gray-600">{viewingTransaction.justificativa}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          {transaction.is_anomaly && editingId !== transaction.id && (
                            <Button size="sm" variant="outline" onClick={() => startEdit(transaction)}>
                              Ajustar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Load more (non-search views) */}
              {!(filters.search && filters.search.trim()) && apiPage < apiTotalPages && (
                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={() => fetchTransactions('append')} disabled={loading}>
                    Carregar mais
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma transação encontrada</p>
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TransactionsList



