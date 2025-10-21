import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import FileUpload from './FileUpload'
import FinancialTracker from './FinancialTracker'
import UploadHistory from './UploadHistory'

export default function ImportData({ onUploadSuccess }) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="bank" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bank">Bancário</TabsTrigger>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="bank">
          {/* Reutiliza o componente existente, limitado a OFX/QFX */}
          <FileUpload onUploadSuccess={onUploadSuccess} allowedExtensions={['ofx','qfx']} />
        </TabsContent>

        <TabsContent value="company">
          {/* Reutiliza o FinancialTracker (inclui upload XLSX e correções) */}
          <FinancialTracker />
        </TabsContent>

        <TabsContent value="history">
          <UploadHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
