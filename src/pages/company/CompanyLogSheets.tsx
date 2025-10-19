import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable, { Column, Action } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { companyAPI } from '@/services/api';
import { LogSheet } from '@/types';
import { FileSpreadsheet, Eye, Plus } from 'lucide-react';

const CompanyLogSheets: React.FC = () => {
  const [logSheets, setLogSheets] = useState<LogSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadLogSheets = async () => {
      try {
        setLoading(true);
        const data = await companyAPI.getLogSheets();
        setLogSheets(data);
      } catch (error) {
        console.error('Failed to load log sheets:', error);
        toast({
          title: "Error",
          description: "Failed to load log sheets",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadLogSheets();
  }, [toast]);

  const columns: Column<LogSheet>[] = [
    {
      key: 'title',
      header: 'Name',
      accessor: (item) => (item as any).logSheetName || (item as any).title || '-',
      className: 'font-medium',
    },
    {
      key: 'selectedMusic',
      header: 'Music Count',
      accessor: (item) => item.selectedMusic?.length || 0,
    },
    {
      key: 'createdDate',
      header: 'Created Date',
      accessor: 'createdDate',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: () => 'Active',
      render: () => 'Active',
    },
  ];

  const actions: Action<LogSheet>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (logSheet) => navigate(`/company/logsheets/${logSheet.id}`),
    },
  ];

  return (
    <DashboardLayout title="Log Sheets">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Log Sheets</h1>
            <p className="text-muted-foreground">
              Manage your music log sheets and track usage
            </p>
          </div>
          <Button onClick={() => navigate('/company/logsheet/create')} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Log Sheet
          </Button>
        </div>

        <DataTable
          data={logSheets}
          columns={columns}
          actions={actions}
          loading={loading}
          searchable={true}
          emptyMessage="No log sheets created yet"
        />
      </div>
    </DashboardLayout>
  );
};

export default CompanyLogSheets;