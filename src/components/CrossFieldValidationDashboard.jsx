import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Play,
  Settings,
  Target,
  Zap,
  Eye,
  Download,
  Link
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import API_CONFIG from '@/config/api.js'

const CrossFieldValidationDashboard = () => {
  const [validationData, setValidationData] = useState(null)
  const [rulesData, setRulesData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedRuleGroup, setSelectedRuleGroup] = useState('financial_transaction')
  const [testData, setTestData] = useState({
    description: 'Transferência PIX para fornecedor',
    amount: 2500.00,
    date: '2024-01-15',
    bank_name: 'Itaú',
    transaction_type: 'debit',
    balance: 15000.00
  })
  const [activeTab, setActiveTab] = useState('validation')

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']

  useEffect(() => {
    fetchRulesData()
  }, [selectedRuleGroup])

  const fetchRulesData = async () => {
    try {
      const response = await fetch(API_CONFIG.getApiUrl(`api/validation/rules/cross-field?rule_group=${selectedRuleGroup}`))
      const data = await response.json()

      if (data.success) {
        setRulesData(data.data)
      }
    } catch (err) {
      console.error('Error fetching rules data:', err)
    }
  }

  const runCrossFieldValidation = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(API_CONFIG.getApiUrl('api/validation/validate/cross-field'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: testData,
          rule_group: selectedRuleGroup,
          context: { source: 'frontend_test' }
        })
      })

      const data = await response.json()

      if (data.success) {
        setValidationData(data.data)
      } else {
        setError(data.error || 'Erro na validação cross-field')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
      console.error('Error running cross-field validation:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportValidationReport = () => {
    const reportData = {
      validationData,
      rulesData,
      testData,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cross-field-validation-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Validação Cross-Field</h2>
          <p className="text-gray-600">Validação de regras de negócio e consistência entre campos</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={exportValidationReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={fetchRulesData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rulesData?.total_count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status da Validação</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {validationData?.is_valid ? 'Válido' : 'Inválido'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros Encontrados</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {validationData?.errors?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Validação</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validationData?.validation_duration_ms?.toFixed(2) || 0}ms
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Validation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Teste de Validação Cross-Field
          </CardTitle>
          <CardDescription>
            Teste regras de validação entre campos relacionados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rule-group">Grupo de Regras</Label>
              <Select value={selectedRuleGroup} onValueChange={setSelectedRuleGroup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial_transaction">Transação Financeira</SelectItem>
                  <SelectItem value="business_logic">Lógica de Negócio</SelectItem>
                  <SelectItem value="temporal_consistency">Consistência Temporal</SelectItem>
                  <SelectItem value="referential_integrity">Integridade Referencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={testData.description}
                onChange={(e) => setTestData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da transação"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={testData.amount}
                onChange={(e) => setTestData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={testData.date}
                onChange={(e) => setTestData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank">Banco</Label>
              <Input
                id="bank"
                value={testData.bank_name}
                onChange={(e) => setTestData(prev => ({ ...prev, bank_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={testData.transaction_type}
                onValueChange={(value) => setTestData(prev => ({ ...prev, transaction_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Crédito</SelectItem>
                  <SelectItem value="debit">Débito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="balance">Saldo</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={testData.balance}
                onChange={(e) => setTestData(prev => ({ ...prev, balance: parseFloat(e.target.value) }))}
              />
            </div>
          </div>

          <Button onClick={runCrossFieldValidation} disabled={loading} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            {loading ? 'Executando Validação...' : 'Executar Validação Cross-Field'}
          </Button>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="validation">Validação</TabsTrigger>
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="compliance">Conformidade</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="validation" className="space-y-4">
          {validationData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Resultados da Validação
                  </CardTitle>
                  <CardDescription>
                    Status detalhado da validação cross-field
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      {validationData.is_valid ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">
                          {validationData.is_valid ? 'Validação Aprovada' : 'Validação Reprovada'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {validationData.errors?.length || 0} erros, {validationData.warnings?.length || 0} avisos
                        </p>
                      </div>
                    </div>

                    {/* Errors */}
                    {validationData.errors?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-700 mb-2">Erros Críticos</h4>
                        <div className="space-y-2">
                          {validationData.errors.map((error, index) => (
                            <Alert key={index} variant="destructive">
                              <XCircle className="h-4 w-4" />
                              <AlertDescription>{error}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Warnings */}
                    {validationData.warnings?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-700 mb-2">Avisos</h4>
                        <div className="space-y-2">
                          {validationData.warnings.map((warning, index) => (
                            <Alert key={index}>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>{warning}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Detalhes Técnicos
                  </CardTitle>
                  <CardDescription>
                    Informações técnicas da validação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {validationData.validation_duration_ms?.toFixed(2) || 0}
                        </div>
                        <div className="text-sm text-gray-600">ms</div>
                        <div className="text-xs text-blue-600">Tempo de Processamento</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {validationData.metadata ? Object.keys(validationData.metadata).length : 0}
                        </div>
                        <div className="text-sm text-gray-600">Regras</div>
                        <div className="text-xs text-green-600">Regras Avaliadas</div>
                      </div>
                    </div>

                    {validationData.metadata && (
                      <div>
                        <h4 className="font-medium mb-2">Metadados da Validação</h4>
                        <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                          {JSON.stringify(validationData.metadata, null, 2)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Link className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Execute a Validação</h3>
                <p className="text-gray-500 text-center mb-4">
                  Configure os dados de teste acima e execute a validação cross-field para ver os resultados.
                </p>
                <Button onClick={runCrossFieldValidation} disabled={loading}>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Validação
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Validação Cross-Field</CardTitle>
              <CardDescription>
                Lista de regras ativas para validação entre campos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rulesData?.rules?.length > 0 ? (
                <div className="space-y-3">
                  {rulesData.rules.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-gray-600">{rule.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={rule.enabled ? "default" : "secondary"}>
                            {rule.enabled ? "Ativo" : "Inativo"}
                          </Badge>
                          <Badge variant="outline">{rule.severity}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{rule.category}</p>
                        <p className="text-xs text-gray-500">Categoria</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma regra encontrada para o grupo selecionado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status de Conformidade</CardTitle>
                <CardDescription>
                  Nível de conformidade com regras de negócio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Conformidade Geral</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Regras Financeiras</span>
                      <span>96%</span>
                    </div>
                    <Progress value={96} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Consistência Temporal</span>
                      <span>89%</span>
                    </div>
                    <Progress value={89} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Integridade Referencial</span>
                      <span>98%</span>
                    </div>
                    <Progress value={98} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Violações</CardTitle>
                <CardDescription>
                  Tipos de violações mais comuns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Regras Financeiras', value: 35, fill: '#8884d8' },
                        { name: 'Consistência Temporal', value: 25, fill: '#82ca9d' },
                        { name: 'Integridade Referencial', value: 20, fill: '#ffc658' },
                        { name: 'Outros', value: 20, fill: '#ff7300' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    />
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Categoria</CardTitle>
                <CardDescription>
                  Tempo de validação por categoria de regras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { category: 'Financeiro', time: 45, rules: 12 },
                      { category: 'Temporal', time: 32, rules: 8 },
                      { category: 'Referencial', time: 28, rules: 6 },
                      { category: 'Negócio', time: 38, rules: 10 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [`${value}${name === 'time' ? 'ms' : ''}`, name === 'time' ? 'Tempo' : 'Regras']} />
                    <Bar dataKey="time" fill="#8884d8" name="time" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendências de Validação</CardTitle>
                <CardDescription>
                  Evolução da taxa de sucesso ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { date: '2024-01', success: 92, errors: 8 },
                      { date: '2024-02', success: 94, errors: 6 },
                      { date: '2024-03', success: 96, errors: 4 },
                      { date: '2024-04', success: 93, errors: 7 },
                      { date: '2024-05', success: 97, errors: 3 },
                      { date: '2024-06', success: 95, errors: 5 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} name="Sucesso (%)" />
                    <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} name="Erros (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default CrossFieldValidationDashboard