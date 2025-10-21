import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'
import { get, ApiError } from '@/services/apiService'

export default function UploadHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await get('api/upload-history')
      if (data?.success) {
        setHistory(data.data?.uploads || [])
      } else {
        setError(data?.error || 'Falha ao carregar histórico de importações')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro de conexão ao buscar histórico de importações')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Histórico de Importações</CardTitle>
            <CardDescription>Últimos arquivos processados (OFX/XLSX)</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchHistory}>Atualizar</Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead className="text-right">Itens Importados</TableHead>
                  <TableHead className="text-right">Duplicatas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(history || []).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.filename}</TableCell>
                    <TableCell className="capitalize">{u.bank_name}</TableCell>
                    <TableCell className="text-right">{u.transactions_count}</TableCell>
                    <TableCell className="text-right">{u.duplicate_entries_count}</TableCell>
                    <TableCell className="capitalize">{u.status}</TableCell>
                    <TableCell>{u.upload_date ? new Date(u.upload_date).toLocaleString('pt-BR') : '-'}</TableCell>
                  </TableRow>
                ))}
                {(!history || history.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      Nenhuma importação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

