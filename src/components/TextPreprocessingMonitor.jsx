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
  FileText,
  Languages,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Play,
  Settings,
  Target,
  Zap,
  Eye,
  Download,
  Globe
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
  Line,
  Area,
  AreaChart
} from 'recharts'
import API_CONFIG from '@/config/api.js'

const TextPreprocessingMonitor = () => {
  const [preprocessingData, setPreprocessingData] = useState(null)
  const [languageData, setLanguageData] = useState(null)
  const [qualityMetrics, setQualityMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [testText, setTestText] = useState('Pagamento de fornecedor para compra de materiais de escritório e equipamentos diversos')
  const [selectedLanguage, setSelectedLanguage] = useState('pt')
  const [activeTab, setActiveTab] = useState('preprocessing')

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0']

  useEffect(() => {
    fetchLanguageData()
  }, [])

  const fetchLanguageData = async () => {
    try {
      // This would typically call a language detection API
      // For now, we'll simulate the data
      setLanguageData({
        detected_languages: [
          { language: 'pt', confidence: 0.95, count: 1250 },
          { language: 'en', confidence: 0.85, count: 89 },
          { language: 'es', confidence: 0.72, count: 34 },
          { language: 'other', confidence: 0.0, count: 12 }
        ],
        total_texts: 1385,
        processing_stats: {
          avg_processing_time: 45,
          success_rate: 98.5,
          cache_hit_rate: 75.2
        }
      })
    } catch (err) {
      console.error('Error fetching language data:', err)
    }
  }

  const runPreprocessing = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate preprocessing API call
      // In production, this would call the actual text preprocessing endpoint
      const mockResult = {
        original_text: testText,
        processed_text: testText
          .toLowerCase()
          .replace(/[àáâãäå]/g, 'a')
          .replace(/[èéêë]/g, 'e')
          .replace(/[ìíîï]/g, 'i')
          .replace(/[òóôõö]/g, 'o')
          .replace(/[ùúûü]/g, 'u')
          .replace(/[ç]/g, 'c'),
        language: selectedLanguage,
        preprocessing_steps: [
          { step: 'normalization', applied: true, changes: 3 },
          { step: 'accent_removal', applied: true, changes: 2 },
          { step: 'stopword_filtering', applied: true, changes: 5 },
          { step: 'stemming', applied: true, changes: 8 }
        ],
        quality_score: 0.92,
        processing_time: 45,
        tokens_before: testText.split(' ').length,
        tokens_after: testText.split(' ').length - 5
      }

      setPreprocessingData(mockResult)

      // Update quality metrics
      setQualityMetrics(prev => ({
        ...prev,
        total_processed: (prev?.total_processed || 0) + 1,
        avg_quality_score: ((prev?.avg_quality_score || 0) * (prev?.total_processed || 0) + mockResult.quality_score) / ((prev?.total_processed || 0) + 1),
        processing_times: [...(prev?.processing_times || []), mockResult.processing_time].slice(-20)
      }))

    } catch (err) {
      setError('Erro no processamento de texto')
      console.error('Error running preprocessing:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportPreprocessingReport = () => {
    const reportData = {
      preprocessingData,
      languageData,
      qualityMetrics,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `text-preprocessing-report-${new Date().toISOString().split('T')[0]}.json`
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
          <h2 className="text-2xl font-bold text-gray-900">Monitor de Pré-processamento de Texto</h2>
          <p className="text-gray-600">Análise e monitoramento do processamento de texto em português</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={exportPreprocessingReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={fetchLanguageData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Textos Processados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qualityMetrics?.total_processed || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de textos analisados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualidade Média</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((qualityMetrics?.avg_quality_score || 0) * 100).toFixed(1)}%
            </div>
            <Progress value={(qualityMetrics?.avg_quality_score || 0) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idiomas Detectados</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {languageData?.detected_languages?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Idiomas identificados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {languageData?.processing_stats?.avg_processing_time || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Por texto processado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preprocessing">Pré-processamento</TabsTrigger>
          <TabsTrigger value="languages">Idiomas</TabsTrigger>
          <TabsTrigger value="quality">Qualidade</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="preprocessing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Preprocessing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Teste de Pré-processamento
                </CardTitle>
                <CardDescription>
                  Teste o pré-processamento de texto em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="en">Inglês</SelectItem>
                      <SelectItem value="es">Espanhol</SelectItem>
                      <SelectItem value="auto">Detecção Automática</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-text">Texto de Teste</Label>
                  <Textarea
                    id="test-text"
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Digite um texto para testar o pré-processamento..."
                    rows={4}
                  />
                </div>

                <Button onClick={runPreprocessing} disabled={loading} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  {loading ? 'Processando...' : 'Executar Pré-processamento'}
                </Button>
              </CardContent>
            </Card>

            {/* Preprocessing Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Resultados do Pré-processamento
                </CardTitle>
                <CardDescription>
                  Visualização dos resultados do processamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {preprocessingData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {(preprocessingData.quality_score * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Score de Qualidade</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {preprocessingData.processing_time}ms
                        </div>
                        <div className="text-sm text-gray-600">Tempo de Processamento</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Texto Original</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {preprocessingData.original_text}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Texto Processado</h4>
                      <p className="text-sm text-gray-600 bg-green-50 p-3 rounded">
                        {preprocessingData.processed_text}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Etapas Aplicadas</h4>
                      <div className="space-y-2">
                        {preprocessingData.preprocessing_steps.map((step, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="capitalize">{step.step.replace('_', ' ')}</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant={step.applied ? "default" : "secondary"}>
                                {step.applied ? 'Aplicado' : 'Não aplicado'}
                              </Badge>
                              {step.changes > 0 && (
                                <span className="text-gray-500">({step.changes} mudanças)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold">{preprocessingData.tokens_before}</div>
                        <div className="text-sm text-gray-600">Tokens Originais</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{preprocessingData.tokens_after}</div>
                        <div className="text-sm text-gray-600">Tokens Após Processamento</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Execute o pré-processamento para ver os resultados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="languages" className="space-y-4">
          {languageData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Distribuição de Idiomas
                  </CardTitle>
                  <CardDescription>
                    Idiomas detectados nos textos processados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={languageData.detected_languages.map(lang => ({
                          name: lang.language.toUpperCase(),
                          value: lang.count,
                          confidence: lang.confidence
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {languageData.detected_languages.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} textos`, name]} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhes dos Idiomas</CardTitle>
                  <CardDescription>
                    Estatísticas detalhadas por idioma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {languageData.detected_languages.map((lang, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <div>
                            <p className="font-medium uppercase">{lang.language}</p>
                            <p className="text-sm text-gray-500">
                              {lang.count} textos ({((lang.count / languageData.total_texts) * 100).toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {(lang.confidence * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">confiança</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Dados de Idiomas</h3>
                <p className="text-gray-500 text-center mb-4">
                  Carregando dados de detecção de idiomas...
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Qualidade</CardTitle>
                <CardDescription>
                  Avaliação da qualidade do pré-processamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Qualidade Geral</span>
                      <span>{((qualityMetrics?.avg_quality_score || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(qualityMetrics?.avg_quality_score || 0) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taxa de Sucesso</span>
                      <span>{languageData?.processing_stats?.success_rate || 0}%</span>
                    </div>
                    <Progress value={languageData?.processing_stats?.success_rate || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cache Hit Rate</span>
                      <span>{languageData?.processing_stats?.cache_hit_rate || 0}%</span>
                    </div>
                    <Progress value={languageData?.processing_stats?.cache_hit_rate || 0} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Scores</CardTitle>
                <CardDescription>
                  Distribuição dos scores de qualidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      { range: '90-100%', count: 45, fill: '#10b981' },
                      { range: '80-89%', count: 32, fill: '#f59e0b' },
                      { range: '70-79%', count: 18, fill: '#f97316' },
                      { range: '60-69%', count: 8, fill: '#ef4444' },
                      { range: '<60%', count: 2, fill: '#dc2626' }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tempo de Processamento</CardTitle>
                <CardDescription>
                  Análise de performance do pré-processamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={qualityMetrics?.processing_times?.map((time, index) => ({
                      process: index + 1,
                      time: time
                    })) || []}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="process" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}ms`, 'Tempo']} />
                    <Line type="monotone" dataKey="time" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Performance</CardTitle>
                <CardDescription>
                  Métricas detalhadas de performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {languageData?.processing_stats?.avg_processing_time || 0}ms
                      </div>
                      <div className="text-sm text-gray-600">Tempo Médio</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {languageData?.processing_stats?.success_rate || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Taxa de Sucesso</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Métricas Adicionais</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Cache Hit Rate:</span>
                        <span className="font-medium">{languageData?.processing_stats?.cache_hit_rate || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Throughput:</span>
                        <span className="font-medium">~22 textos/seg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memória Utilizada:</span>
                        <span className="font-medium">~45MB</span>
                      </div>
                    </div>
                  </div>
                </div>
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

export default TextPreprocessingMonitor