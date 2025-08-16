import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Building2
} from 'lucide-react'

const FileUpload = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const supportedBanks = [
    { name: 'Caixa Econômica Federal', code: 'caixa' },
    { name: 'Sicoob', code: 'sicoob' },
    { name: 'Nubank', code: 'nubank' },
    { name: 'Itaú', code: 'itau' }
  ]

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
    if (!file.name.toLowerCase().endsWith('.ofx') && !file.name.toLowerCase().endsWith('.qfx')) {
      setError('Apenas arquivos .ofx e .qfx são suportados.')
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

      const response = await fetch('/api/upload-ofx', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setUploadResult(data)
        if (onUploadSuccess) {
          onUploadSuccess()
        }
      } else {
        setError(data.error || 'Erro ao processar arquivo')
      }
    } catch (err) {
      setError(err.message || 'Erro ao enviar arquivo')
      setError('Erro de conexão. Verifique se o servidor está rodando.')
    } finally {
      setUploading(false)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      {/* Informações sobre bancos suportados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Bancos Suportados
          </CardTitle>
          <CardDescription>
            O Maria Conciliadora processa arquivos OFX dos seguintes bancos:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {supportedBanks.map((bank) => (
              <Badge key={bank.code} variant="secondary" className="justify-center py-2">
                {bank.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Área de Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload de Arquivo OFX
          </CardTitle>
          <CardDescription>
            Arraste e solte seu arquivo OFX aqui ou clique para selecionar
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
              accept=".ofx,.qfx"
              onChange={handleFileInput}
              className="hidden"
            />
            
            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Processando arquivo...</p>
                  <p className="text-sm text-gray-500">Analisando transações e aplicando IA</p>
                </div>
                <Progress value={75} className="w-full max-w-xs mx-auto" />
              </div>
            ) : (
              <div className="space-y-4">
                <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Selecione um arquivo OFX
                  </p>
                  <p className="text-sm text-gray-500">
                    Formatos suportados: .ofx, .qfx (máx. 16MB)
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
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p className="font-medium">{uploadResult.message}</p>
              <div className="text-sm space-y-1">
                <p>• Banco: {uploadResult.data.bank_name}</p>
                <p>• Transações importadas: {uploadResult.data.transactions_imported}</p>
                {uploadResult.data.duplicates_found > 0 && (
                  <p>• Duplicatas encontradas: {uploadResult.data.duplicates_found}</p>
                )}
                <p>• Total de receitas: R$ {uploadResult.data.summary.total_credits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p>• Total de gastos: R$ {uploadResult.data.summary.total_debits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Como obter seu arquivo OFX?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Internet Banking</h4>
              <p className="text-sm text-gray-600">
                Acesse o site do seu banco, vá em "Extratos" ou "Movimentação" e procure pela opção de exportar em formato OFX.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Aplicativo Mobile</h4>
              <p className="text-sm text-gray-600">
                Alguns bancos permitem exportar extratos em OFX diretamente pelo aplicativo móvel.
              </p>
            </div>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Dica:</strong> O arquivo OFX geralmente está disponível na seção de extratos ou relatórios do seu banco. 
              Procure por "Exportar", "Download" ou "Formato OFX/Money".
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

export default FileUpload

