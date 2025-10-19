import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataTable, { Column, Action } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { licenseAPI } from '@/services/api';
import { LegalEntity, NaturalPersonEntity } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Building2, User, Eye, CheckCircle, XCircle } from 'lucide-react';

const AdminLicenseApplications: React.FC = () => {
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [naturalPersons, setNaturalPersons] = useState<NaturalPersonEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const [legalData, naturalData] = await Promise.all([
          licenseAPI.getAllLegalEntities(),
          licenseAPI.getAllNaturalPersons(),
        ]);
        setLegalEntities(legalData);
        setNaturalPersons(naturalData);
      } catch (error) {
        console.error('Failed to load license applications:', error);
        toast({
          title: "Error",
          description: "Failed to load license applications",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [toast]);

  const legalEntityColumns: Column<LegalEntity>[] = [
    {
      key: 'companyName',
      header: 'Company Name',
      accessor: 'companyName',
      className: 'font-medium',
    },
    {
      key: 'companyShortName',
      header: 'Short Name',
      accessor: 'companyShortName',
    },
    {
      key: 'registrationNumber',
      header: 'Registration No.',
      accessor: 'registrationNumber',
    },
    {
      key: 'ownerFirstName',
      header: 'Owner',
      accessor: (item) => `${item.ownerFirstName} ${item.ownerLastName}`,
    },
    {
      key: 'ownerEmail',
      header: 'Contact Email',
      accessor: 'ownerEmail',
    },
    {
      key: 'cityOrTown',
      header: 'Location',
      accessor: 'cityOrTown',
    },
    {
      key: 'musicUsageType',
      header: 'Usage Type',
      accessor: (item) => item.musicUsageType?.usageType || '-',
    },
  ];

  const naturalPersonColumns: Column<NaturalPersonEntity>[] = [
    {
      key: 'firstName',
      header: 'First Name',
      accessor: 'firstName',
      className: 'font-medium',
    },
    {
      key: 'surname',
      header: 'Surname',
      accessor: 'surname',
    },
    {
      key: 'idNumber',
      header: 'ID Number',
      accessor: 'idNumber',
    },
    {
      key: 'email',
      header: 'Email',
      accessor: 'email',
    },
    {
      key: 'phone',
      header: 'Phone',
      accessor: 'phone',
    },
    {
      key: 'cityOrTown',
      header: 'Location',
      accessor: 'cityOrTown',
    },
    {
      key: 'tradingNameOfBusiness',
      header: 'Business Name',
      accessor: 'tradingNameOfBusiness',
    },
  ];

  const legalEntityActions: Action<LegalEntity>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (item) => {
        // Show detailed view in modal or navigate to detail page
        toast({
          title: "Application Details",
          description: `${item.companyName} - ${item.ownerFirstName} ${item.ownerLastName}`,
        });
      },
    },
    {
      label: 'Approve',
      icon: CheckCircle,
      variant: 'success',
      onClick: async (item) => {
        if (window.confirm(`Approve license application for ${item.companyName}?`)) {
          toast({
            title: "Application Approved",
            description: `License approved for ${item.companyName}`,
          });
        }
      },
    },
    {
      label: 'Reject',
      icon: XCircle,
      variant: 'destructive',
      onClick: async (item) => {
        const reason = window.prompt('Enter rejection reason:');
        if (reason) {
          toast({
            title: "Application Rejected",
            description: `License rejected for ${item.companyName}`,
          });
        }
      },
    },
  ];

  const naturalPersonActions: Action<NaturalPersonEntity>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (item) => {
        toast({
          title: "Application Details",
          description: `${item.firstName} ${item.surname} - ${item.email}`,
        });
      },
    },
    {
      label: 'Approve',
      icon: CheckCircle,
      variant: 'success',
      onClick: async (item) => {
        if (window.confirm(`Approve license application for ${item.firstName} ${item.surname}?`)) {
          toast({
            title: "Application Approved",
            description: `License approved for ${item.firstName} ${item.surname}`,
          });
        }
      },
    },
    {
      label: 'Reject',
      icon: XCircle,
      variant: 'destructive',
      onClick: async (item) => {
        const reason = window.prompt('Enter rejection reason:');
        if (reason) {
          toast({
            title: "Application Rejected",
            description: `License rejected for ${item.firstName} ${item.surname}`,
          });
        }
      },
    },
  ];

  return (
    <DashboardLayout title="License Applications">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">License Applications</h1>
          <p className="text-muted-foreground">
            Review and manage license applications from legal entities and natural persons
          </p>
        </div>

        <Tabs defaultValue="legal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Legal Entities ({legalEntities.length})
            </TabsTrigger>
            <TabsTrigger value="natural" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Natural Persons ({naturalPersons.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="legal">
            <Card>
              <CardHeader>
                <CardTitle>Legal Entity Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={legalEntities}
                  columns={legalEntityColumns}
                  actions={legalEntityActions}
                  loading={loading}
                  searchable={true}
                  emptyMessage="No legal entity applications"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="natural">
            <Card>
              <CardHeader>
                <CardTitle>Natural Person Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={naturalPersons}
                  columns={naturalPersonColumns}
                  actions={naturalPersonActions}
                  loading={loading}
                  searchable={true}
                  emptyMessage="No natural person applications"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminLicenseApplications;