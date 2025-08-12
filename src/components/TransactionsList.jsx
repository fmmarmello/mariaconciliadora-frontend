import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Calendar,
  Building2,
  Tag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const TransactionsList = ({ transactions: initialTransactions }) => {
  const [transactions, setTransactions] = useState(initialTransactions || [])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    bank: '',
    category: '',
    type: '',
    startDate: '',
    endDate: ''
  })

  const itemsPerPage = 20

  useEffect(() => {
    if (initialTransactions) {
      setTransactions(initialTransactions)
    } else {
      fetchTransactions()
    }
  }, [initialTransactions])

  useEffect(() => {
    applyFilters()
  }, [transactions, filters])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        limit: 100,
        offset: 0
      })

      const response = await fetch(`/api/transactions?${queryParams}`)
      const data = await response.json()
      
      if (data.success) {
        setTransactions(data.data.transactions)
      }
    } catch (error) {
      console.error('Erro ao buscar transações:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Filtro de busca
    if (filters.search) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Filtro por banco
    if (filters.bank) {
      filtered = filtered.filter(t => t.bank_name === filters.bank)
    }

    // Filtro por categoria
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category)
    }

    // Filtro por tipo
    if (filters.type) {
      filtered = filtered.filter(t => t.transaction_type === filters.type)
    }

    // Filtro por data
    if (filters.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate))
    }
    if (filters.endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate))
    }

    setFilteredTransactions(filtered)
    setCurrentPage(1)
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
      'casa': 'bg-green-100 text-green-800',
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
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
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
                  className="pl-10"
                />
              </div>
            </div>

            {/* Banco */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Banco</label>
              <Select value={filters.bank} onValueChange={(value) => handleFilterChange('bank', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os bancos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os bancos</SelectItem>
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
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
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
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
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
              />
            </div>

            {/* Data Final */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              {filteredTransactions.length} transação(ões) encontrada(s)
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
          <CardDescription>
            Página {currentPage} de {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : currentTransactions.length > 0 ? (
            <div className="space-y-3">
              {currentTransactions.map((transaction, index) => (
                <div
                  key={transaction.id || index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm">{transaction.description}</p>
                      {transaction.is_anomaly && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Anomalia
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center">
                        <Building2 className="h-3 w-3 mr-1" />
                        {transaction.bank_name}
                      </div>
                      {transaction.category && (
                        <Badge variant="secondary" className={`text-xs ${getCategoryColor(transaction.category)}`}>
                          <Tag className="h-3 w-3 mr-1" />
                          {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center font-bold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {transaction.amount > 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))}
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

