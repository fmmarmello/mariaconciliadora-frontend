import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  RotateCcw
} from 'lucide-react'
import API_CONFIG from '@/config/api.js'
import { post, ApiError } from '@/services/apiService';

const FinancialTrackerCorrections = ({ incompleteEntries, onCorrectionsSaved }) => {
  const [corrections, setCorrections] = useState([])
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Inicializa as correções com os dados incompletos
    if (incompleteEntries && incompleteEntries.length > 0) {
      const initialCorrections = incompleteEntries.map(entry => ({
        ...entry,
        corrected: false
      }))
      setCorrections(initialCorrections)
    }
  }, [incompleteEntries])

  const handleFieldChange = (index, field, value) => {
    const updatedCorrections = [...corrections]
    updatedCorrections[index][field] = value
    // Marca como corrigido quando o usuário altera um campo
    updatedCorrections[index].corrected = true
    setCorrections(updatedCorrections)
  }

  const handleSaveCorrections = async () => {
    setError(null)
    setSaveResult(null)
    setSaving(true)

    try {
      // Filtra apenas as entradas que foram corrigidas
      const correctedEntries = corrections
        .filter(entry => entry.corrected)
        .map(entry => {
          // Remove campos extras que não são necessários para o envio
          const { row_number: _row_number, error: _error, corrected: _corrected, ...cleanEntry } = entry
          return cleanEntry
        })
 
      if (correctedEntries.length === 0) {
        setError('Nenhuma correção foi feita.')
        return
      }
 
      const data = await post('api/upload-xlsx-corrected', { entries: correctedEntries })
 
      setSaveResult(data)
      // Notifica o componente pai que as correções foram salvas
      if (onCorrectionsSaved) {
        onCorrectionsSaved()
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro de conexão. Verifique se o servidor está rodando.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleResetEntry = (index) => {
    const updatedCorrections = [...corrections]
    // Reseta para os valores originais
    const originalEntry = incompleteEntries[index]
    updatedCorrections[index] = {
      ...originalEntry,
      corrected: false
    }
    setCorrections(updatedCorrections)
  }

  if (!incompleteEntries || incompleteEntries.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
            Correção de Dados Incompletos
          </CardTitle>
          <CardDescription>
            {incompleteEntries.length} entradas requerem correção antes de serem salvas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {corrections.map((entry, index) => (
              <Card key={index} className={entry.corrected ? "border-green-500" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">
                      Linha {entry.row_number}: {entry.error}
                    </h3>
                    {entry.corrected && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Corrigido</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`date-${index}`}>Data</Label>
                      <Input
                        id={`date-${index}`}
                        type="date"
                        value={entry.date ? new Date(entry.date).toISOString().split('T')[0] : ""}
                        onChange={(e) => handleFieldChange(index, 'date', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`amount-${index}`}>Valor</Label>
                      <Input
                        id={`amount-${index}`}
                        type="number"
                        step="0.01"
                        value={entry.amount || ""}
                        onChange={(e) => handleFieldChange(index, 'amount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`description-${index}`}>Descrição *</Label>
                      <Textarea
                        id={`description-${index}`}
                        value={entry.description || ""}
                        onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                        placeholder="Descrição da transação"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`category-${index}`}>Categoria</Label>
                      <Input
                        id={`category-${index}`}
                        value={entry.category || ""}
                        onChange={(e) => handleFieldChange(index, 'category', e.target.value)}
                        placeholder="Categoria"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`cost-center-${index}`}>Centro de Custo</Label>
                      <Input
                        id={`cost-center-${index}`}
                        value={entry.cost_center || ""}
                        onChange={(e) => handleFieldChange(index, 'cost_center', e.target.value)}
                        placeholder="Centro de custo"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`department-${index}`}>Departamento</Label>
                      <Input
                        id={`department-${index}`}
                        value={entry.department || ""}
                        onChange={(e) => handleFieldChange(index, 'department', e.target.value)}
                        placeholder="Departamento"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`project-${index}`}>Projeto</Label>
                      <Input
                        id={`project-${index}`}
                        value={entry.project || ""}
                        onChange={(e) => handleFieldChange(index, 'project', e.target.value)}
                        placeholder="Projeto"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`transaction-type-${index}`}>Tipo</Label>
                      <Select
                        value={entry.transaction_type || "expense"}
                        onValueChange={(value) => handleFieldChange(index, 'transaction_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">Despesa</SelectItem>
                          <SelectItem value="income">Receita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetEntry(index)}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Resetar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Resultado do salvamento */}
            {saveResult && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p className="font-medium">{saveResult.message}</p>
                    <p className="text-sm">
                      {saveResult.data.items_imported} entradas foram salvas com sucesso.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Erro */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSaveCorrections}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Correções
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FinancialTrackerCorrections