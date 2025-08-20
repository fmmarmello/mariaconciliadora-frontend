import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle,
  Trash2,
  CheckCircle,
  Loader2,
  Calendar,
  FileText,
  Database
} from 'lucide-react';
import API_CONFIG from '@/config/api.js';

export default function TestDataDeletion() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: preview, 1: confirmation, 2: execution
  const [daysOld, setDaysOld] = useState(30);
  const [isExecuting, setIsExecuting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [confirmationData, setConfirmationData] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if test data deletion is enabled
  useEffect(() => {
    const checkConfig = async () => {
      try {
        // We'll check the backend configuration by making a request to the test data endpoint
        // This is a simple way to determine if the feature is enabled
        const response = await fetch(API_CONFIG.getApiUrl('api/test-data?mode=preview&days_old=30'));
        
        // If we get a 403 error, it means the feature is disabled
        if (response.status === 403) {
          setIsEnabled(false);
        } else {
          setIsEnabled(true);
        }
      } catch (error) {
        // If we can't reach the endpoint, assume it's disabled
        setIsEnabled(false);
      }
    };

    checkConfig();
  }, []);

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_CONFIG.getApiUrl(`api/test-data?mode=preview&days_old=${daysOld}`));
      const data = await response.json();
      
      if (data.success) {
        setPreviewData(data.data);
        setCurrentStep(1);
      } else {
        setError(data.error || 'Failed to fetch preview data');
      }
    } catch (err) {
      setError('Failed to fetch preview data: ' + err.message);
      console.error('Failed to fetch preview data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_CONFIG.getApiUrl(`api/test-data?mode=confirmation&days_old=${daysOld}`));
      const data = await response.json();
      
      if (data.success) {
        setConfirmationData(data.data);
        setCurrentStep(2);
      } else {
        setError(data.error || 'Failed to get confirmation data');
      }
    } catch (err) {
      setError('Failed to get confirmation data: ' + err.message);
      console.error('Failed to get confirmation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsExecuting(true);
    setError(null);
    
    try {
      const response = await fetch(API_CONFIG.getApiUrl(`api/test-data?mode=execution&days_old=${daysOld}&force=true`));
      const data = await response.json();
      
      if (data.success) {
        setExecutionResult({
          success: true,
          message: data.message
        });
        setCurrentStep(3);
      } else {
        setExecutionResult({
          success: false,
          error: data.error || 'Deletion failed'
        });
        setError(data.error || 'Deletion failed');
      }
    } catch (err) {
      setExecutionResult({
        success: false,
        error: 'Deletion failed: ' + err.message
      });
      setError('Deletion failed: ' + err.message);
      console.error('Deletion failed:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const resetProcess = () => {
    setCurrentStep(0);
    setPreviewData(null);
    setConfirmationData(null);
    setExecutionResult(null);
    setError(null);
    setDaysOld(30);
  };

  if (!isEnabled) {
    return (
      <Card className="border-dashed border-gray-300 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trash2 className="h-5 w-5 mr-2 text-gray-500" />
            Exclusão de Dados de Teste
          </CardTitle>
          <CardDescription>
            O recurso de exclusão de dados de teste está desativado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              O recurso de exclusão de dados de teste não está habilitado no servidor. 
              Verifique a configuração <code>ENABLE_TEST_DATA_DELETION=true</code> no arquivo <code>.env</code>.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trash2 className="h-5 w-5 mr-2" />
          Exclusão de Dados de Teste
        </CardTitle>
        <CardDescription>
          Processo de exclusão de dados de teste com verificação em três etapas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Etapa 1: Visualização</h3>
                <p className="text-sm text-gray-500">Pré-visualização dos dados que serão excluídos</p>
              </div>
              <Badge variant="secondary">1 de 3</Badge>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="days-old" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Idade dos dados (dias)
                </Label>
                <Input
                  id="days-old"
                  type="number"
                  value={daysOld}
                  onChange={(e) => setDaysOld(parseInt(e.target.value) || 30)}
                  min="1"
                  max="365"
                  className="w-32 mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Apenas dados com mais de {daysOld} dias serão considerados como dados de teste
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Dados que serão excluídos
                </h4>
                <p className="text-sm text-gray-600 mt-2">
                  Esta etapa irá identificar todos os dados que têm mais de {daysOld} dias e 
                  estão relacionados a transações, entradas financeiras e histórico de upload.
                </p>
              </div>

              <Button 
                onClick={handlePreview} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Visualizar Dados'
                )}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 1 && previewData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Etapa 2: Confirmação</h3>
                <p className="text-sm text-gray-500">Confirme os dados que serão excluídos</p>
              </div>
              <Badge variant="secondary">2 de 3</Badge>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  Resumo dos dados a serem excluídos
                </h4>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between">
                    <span>Transações:</span>
                    <span className="font-medium">{previewData.transactions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entradas Financeiras:</span>
                    <span className="font-medium">{previewData.company_financial || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Histórico de Upload:</span>
                    <span className="font-medium">{previewData.upload_history || 0}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{previewData.total_count || 0}</span>
                  </div>
                </div>
              </div>

              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">Atenção:</p>
                  <p>Esta ação excluirá permanentemente os dados listados acima.</p>
                  <p className="mt-1">Esta operação não pode ser desfeita.</p>
                </AlertDescription>
              </Alert>

              <div className="flex space-x-3">
                <Button 
                  onClick={handleConfirm} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirmando...
                    </>
                  ) : (
                    'Confirmar Exclusão'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetProcess}
                >
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && confirmationData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Etapa 3: Execução</h3>
                <p className="text-sm text-gray-500">Confirmação final da exclusão</p>
              </div>
              <Badge variant="secondary">3 de 3</Badge>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  Detalhes da exclusão
                </h4>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between">
                    <span>Transações:</span>
                    <span className="font-medium">{confirmationData.transactions?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entradas Financeiras:</span>
                    <span className="font-medium">{confirmationData.company_financial?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Histórico de Upload:</span>
                    <span className="font-medium">{confirmationData.upload_history?.length || 0}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{confirmationData.total_count || 0}</span>
                  </div>
                </div>
              </div>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">Confirmação Final:</p>
                  <p>Esta é sua última chance de cancelar a exclusão.</p>
                  <p className="mt-1">Digite <span className="font-mono bg-red-100 px-1 rounded">DELETE</span> para confirmar:</p>
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Digite DELETE para confirmar"
                      className="w-full p-2 border rounded"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value === 'DELETE') {
                          handleDelete();
                        }
                      }}
                    />
                  </div>
                </AlertDescription>
              </Alert>

              <div className="flex space-x-3">
                <Button 
                  onClick={handleDelete} 
                  disabled={isExecuting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    'Excluir Dados'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetProcess}
                >
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && executionResult && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Conclusão</h3>
                <p className="text-sm text-gray-500">Processo de exclusão concluído</p>
              </div>
              <Badge variant="secondary">Concluído</Badge>
            </div>

            <div className="space-y-4">
              {executionResult.success ? (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <p className="font-medium text-green-800">Exclusão concluída com sucesso!</p>
                    <p className="mt-1">{executionResult.message}</p>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">Falha na exclusão</p>
                    <p className="mt-1">{executionResult.error}</p>
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={resetProcess} 
                className="w-full"
              >
                Realizar outra exclusão
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}