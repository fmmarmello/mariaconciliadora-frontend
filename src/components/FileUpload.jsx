import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.jsx'
import { Input } from '@/components/ui/input.jsx'
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2
} from 'lucide-react'

import API_CONFIG from '@/config/api.js'
import { post, ApiError } from '@/services/apiService';

const FileUpload = ({ onUploadSuccess, allowedExtensions = ['ofx','qfx','xlsx'] }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState(null)
  const [duplicateFileError, setDuplicateFileError] = useState(null)
  const fileInputRef = useRef(null)

  const acceptString = allowedExtensions.map((ext) => `.${ext}`).join(',')
  const isXlsxAllowed = Array.isArray(allowedExtensions) && allowedExtensions.includes('xlsx')

  // Form validation schema
  const fileUploadSchema = z.object({
    file: z
      .instanceof(File)
      .refine((file) => file.size <= 16 * 1024 * 1024, {
        message: 'Arquivo muito grande. Tamanho máximo: 16MB.'
      })
      .refine((file) => {
        const extension = file.name.toLowerCase().split('.').pop()
        return allowedExtensions.includes(extension)
      }, {
        message: 'Apenas arquivos ' + allowedExtensions.map((ext)=>'.'+ext).join(', ') + ' sao suportados.'
      })
  })

  const form = useForm({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      file: null
    }
  })

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

  const onSubmit = async (values) => {
    setError(null)
    setUploadResult(null)
    setDuplicateFileError(null)

    const file = values.file
    const fileExtension = file.name.toLowerCase().split('.').pop();

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Determine the endpoint based on file extension
      const endpoint = fileExtension === 'xlsx' ? 'api/upload-xlsx' : 'api/upload-ofx';

      const data = await post(endpoint, formData);

      setUploadResult(data)
      if (onUploadSuccess) {
        onUploadSuccess()
      }
    } catch (err) {
      if (err instanceof ApiError && err.data) {
        if (err.data.error_code === 'FILE_PROCESSING_DUPLICATEFILEERROR') {
          const originalDate = err.data.details?.original_upload_date
            ? new Date(err.data.details.original_upload_date).toLocaleDateString('pt-BR')
            : 'desconhecida';
          setDuplicateFileError({
            message: `Este arquivo já foi enviado em ${originalDate}.`,
            filename: err.data.details?.filename
          });
        } else {
          setError(err.data.message || err.message || 'Erro ao processar arquivo');
        }
      } else {
        setError(err.message || 'Erro ao enviar arquivo');
      }
    } finally {
      setUploading(false)
    }
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
            {isXlsxAllowed && (
            <p className="text-sm text-gray-600 mt-2">
              Também é possível importar dados financeiros da empresa através de arquivos XLSX.
            </p>
            )}
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
            Upload de Arquivo Bancário ou Financeiro
          </CardTitle>
          <CardDescription>
            Arraste e solte seu arquivo OFX ou XLSX aqui ou clique para selecionar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setDragActive(false)

                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            const file = e.dataTransfer.files[0]
                            onChange(file)
                          }
                        }}
                      >
                        <input
                          {...field}
                          ref={fileInputRef}
                          type="file"
                          accept={acceptString}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              onChange(file)
                            }
                          }}
                          className="hidden"
                        />

                        {uploading ? (
                          <div className="space-y-4">
                            <Loader2 className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
                            <div>
                              <p className="text-lg font-medium text-gray-900">Processando arquivo...</p>
                              <p className="text-sm text-gray-500">Analisando dados e aplicando IA</p>
                            </div>
                            <Progress value={75} className="w-full max-w-xs mx-auto" />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-lg font-medium text-gray-900">
                                Selecione um arquivo OFX ou XLSX
                              </p>
                              <p className="text-sm text-gray-500">
                                Formatos suportados: .ofx, .qfx, .xlsx (máx. 16MB)
                              </p>
                              {value && (
                                <p className="text-sm text-blue-600 mt-2">
                                  Arquivo selecionado: {value.name}
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                            >
                              Selecionar Arquivo
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Arraste e solte o arquivo aqui ou clique para selecionar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center">
                <Button type="submit" disabled={uploading || !form.watch('file')}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Fazer Upload
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
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
                {uploadResult.data && (
                  <>
                    {uploadResult.data.bank_name && (
                      <p>• Banco: {uploadResult.data.bank_name}</p>
                    )}
                    {uploadResult.data.items_imported && (
                      <p>• Itens importados: {uploadResult.data.items_imported}</p>
                    )}
                    {uploadResult.data.duplicates_found > 0 && (
                      <p>• Duplicatas encontradas: {uploadResult.data.duplicates_found}</p>
                    )}
                    {uploadResult.data.saved_count !== undefined && (
                      <p>• Entradas salvas: {uploadResult.data.saved_count}</p>
                    )}
                    {uploadResult.data.duplicate_files_count !== undefined && (
                      <p>• Arquivos duplicados detectados: {uploadResult.data.duplicate_files_count}</p>
                    )}
                    {uploadResult.data.duplicate_entries_count !== undefined && (
                      <p>• Entradas duplicadas detectadas: {uploadResult.data.duplicate_entries_count}</p>
                    )}
                    {uploadResult.data.total_entries_processed !== undefined && (
                      <p>• Total de entradas processadas: {uploadResult.data.total_entries_processed}</p>
                    )}
                    {uploadResult.data.summary && (
                      <>
                        <p>• Total de receitas: R$ {uploadResult.data.summary.total_credits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p>• Total de gastos: R$ {uploadResult.data.summary.total_debits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </>
                    )}
                  </>
                )}
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

      {/* Erro de arquivo duplicado */}
      {duplicateFileError && (
        <Alert variant="destructive" className="border-yellow-200 bg-yellow-50 text-yellow-800">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <p className="font-medium">Arquivo Duplicado</p>
            <p>{duplicateFileError.message}</p>
            <p className="text-xs text-gray-600 mt-1">Arquivo: {duplicateFileError.filename}</p>
          </AlertDescription>
        </Alert>
      )}

    </div>
  )
}

export default FileUpload


