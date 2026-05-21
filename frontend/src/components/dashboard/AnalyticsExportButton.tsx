import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { generateWorkshopReport, ReportData } from '@/services/reportService';
import { toast } from 'sonner';
import type { CustomerRow, JobCardRow, MechanicRow } from '@/types/backendRows';

interface AnalyticsExportButtonProps {
  jobCards: JobCardRow[];
  customers: CustomerRow[];
  mechanics: MechanicRow[];
}

const WORKSHOP_SETTINGS_KEY = 'sc-workshop-settings-v1';

export const AnalyticsExportButton = ({ jobCards, customers, mechanics }: AnalyticsExportButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      // Fetch workshop settings from localStorage
      const savedSettings = localStorage.getItem(WORKSHOP_SETTINGS_KEY);
      const workshopSettings = savedSettings ? JSON.parse(savedSettings) : { workshopName: 'Workshop' };

      const reportData: ReportData = {
        jobCards,
        customers,
        mechanics,
        workshopSettings,
      };

      // Small delay for UX feel
      await new Promise(resolve => setTimeout(resolve, 800));
      
      generateWorkshopReport(reportData);
      toast.success('Analytics Report downloaded successfully!', {
        description: 'Open the .xlsx file in Google Sheets or Excel.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isGenerating}
      variant="outline"
      className="rounded-xl h-9 text-xs gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all group"
    >
      {isGenerating ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileSpreadsheet className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
      )}
      {isGenerating ? 'Generating...' : 'Export Analytics'}
      {!isGenerating && <Download className="h-3 w-3 opacity-50" />}
    </Button>
  );
};
