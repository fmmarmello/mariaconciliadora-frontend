import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  BarChart3,
  Database,
  FileSpreadsheet,
  Info
} from 'lucide-react'

import API_CONFIG from '@/config/api.js'
import { post, ApiError } from '@/services/apiService'

const XLSXAnalysisTest = () => {
  const [dragActive, setDragActive] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

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
    setAnalysisResult(null)

    // Validations
    const fileExtension = file.name.toLowerCase().split('.').pop()
    if (fileExtension !== 'xlsx') {
      setError('Apenas arquivos .xlsx são suportados para análise.')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('Arquivo muito grande. Tamanho máximo: 10MB.')
      return
    }

    setAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const data = await post('api/analyze-xlsx', formData)

      setAnalysisResult(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Erro ao analisar arquivo')
      } else {
        setError(err.message || 'Erro ao enviar arquivo')
      }
    } finally {
      setAnalyzing(false)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case 'Bank Statement':
        return 'bg-blue-100 text-blue-800'
      case 'Company Financial Data':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDataTypeColor = (dataType) => {
    switch (dataType) {
      case 'date':
        return 'bg-purple-100 text-purple-800'
      case 'numeric':
        return 'bg-orange-100 text-orange-800'
      case 'text':
        return 'bg-indigo-100 text-indigo-800'
      case 'boolean':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            XLSX Analysis Test
          </CardTitle>
          <CardDescription>
            Teste a análise inteligente de arquivos XLSX para determinar se são extratos bancários ou dados financeiros da empresa
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload de Arquivo XLSX para Análise
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
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileInput}
              className="hidden"
            />

            {analyzing ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Analisando arquivo...</p>
                  <p className="text-sm text-gray-500">Examinando estrutura e conteúdo</p>
                </div>
                <Progress value={60} className="w-full max-w-xs mx-auto" />
              </div>
            ) : (
              <div className="space-y-4">
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Selecione um arquivo XLSX
                  </p>
                  <p className="text-sm text-gray-500">
                    Formato suportado: .xlsx (máx. 10MB)
                  </p>
                </div>
                <Button onClick={openFileDialog} disabled={analyzing}>
                  Selecionar Arquivo
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* File Type Determination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Resultado da Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Tipo de Arquivo Detectado:</span>
                  <Badge className={getFileTypeColor(analysisResult.data.file_type)}>
                    {analysisResult.data.file_type}
                  </Badge>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Fatores considerados na decisão:</strong>
                    <ul className="mt-2 space-y-1">
                      {analysisResult.data.analysis.decision_factors.map((factor, index) => (
                        <li key={index} className="text-sm">• {factor}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* File Structure Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Análise da Estrutura do Arquivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analysisResult.data.summary.total_rows}</div>
                    <div className="text-sm text-gray-500">Linhas Totais</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analysisResult.data.summary.total_columns}</div>
                    <div className="text-sm text-gray-500">Colunas Totais</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{(analysisResult.data.summary.file_size / 1024).toFixed(1)} KB</div>
                    <div className="text-sm text-gray-500">Tamanho do Arquivo</div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Coluna</TableHead>
                      <TableHead>Tipo de Dado</TableHead>
                      <TableHead>Valores Ausentes</TableHead>
                      <TableHead>Amostra de Dados</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisResult.data.structure.columns.map((colName) => (
                      <TableRow key={colName}>
                        <TableCell className="font-medium">{colName}</TableCell>
                        <TableCell>
                          <Badge className={getDataTypeColor(analysisResult.data.structure.data_types[colName])}>
                            {analysisResult.data.structure.data_types[colName]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {analysisResult.data.structure.missing_values[colName]} ({((analysisResult.data.structure.missing_values[colName] / analysisResult.data.summary.total_rows) * 100).toFixed(1)}%)
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {analysisResult.data.structure.sample_data[colName].slice(0, 3).join(', ')}
                          {analysisResult.data.structure.sample_data[colName].length > 3 && '...'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Data Quality Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Qualidade dos Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Completude Geral</span>
                      <span className="text-sm text-gray-500">{analysisResult.data.analysis.data_quality.overall_completeness.toFixed(1)}%</span>
                    </div>
                    <Progress value={analysisResult.data.analysis.data_quality.overall_completeness} className="w-full" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{analysisResult.data.analysis.data_quality.columns_with_missing_data}</div>
                    <div className="text-sm text-gray-500">Colunas com Dados Ausentes</div>
                  </div>
                </div>

                {analysisResult.data.analysis.recommendations.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Recomendações:</strong>
                      <ul className="mt-2 space-y-1">
                        {analysisResult.data.analysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm">• {rec}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Completion Message */}
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-2">
                <p className="font-medium">Teste de Análise XLSX Concluído com Sucesso!</p>
                <p className="text-sm">
                  O arquivo <strong>{analysisResult.data.summary.filename}</strong> foi analisado completamente.
                  A análise determinou que se trata de <strong>{analysisResult.data.file_type}</strong> com base em
                  {analysisResult.data.analysis.data_quality.overall_completeness.toFixed(1)}% de completude dos dados.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Como Funciona a Análise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Análise de Estrutura</h4>
              <p className="text-sm text-gray-600">
                Examina os nomes das colunas, tipos de dados e padrões para identificar características específicas de extratos bancários ou dados financeiros empresariais.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Detecção de Padrões</h4>
              <p className="text-sm text-gray-600">
                Identifica elementos como símbolos de moeda, formatos de data brasileiros, presença de saldos e outros indicadores específicos.
              </p>
            </div>
          </div>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Nota:</strong> Esta análise não salva os dados no banco de dados, apenas examina a estrutura e conteúdo do arquivo para fins de teste e validação.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

export default XLSXAnalysisTest