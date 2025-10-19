import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AdminPendingProfiles from './AdminPendingProfiles';
import AdminPendingMusic from './AdminPendingMusic';
import AdminLicenseApplications from './AdminLicenseApplications';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import AdminPerformance from './AdminPerformance';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { adminAPI, invoiceAPI, statusAPI } from '@/services/api';
import DataTable, { Column } from '@/components/common/DataTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { Company, Admin as AdminType, ArtistWork, LogSheet, MemberDetails, Invoice, ArtistInvoiceReports, User, Status } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Play, Download, Eye, Music } from 'lucide-react';
import InvoiceForm from './InvoiceForm';

// Placeholder pages to resolve 404s; can be expanded
import ArtistPaymentForm from "./ArtistPaymentForm";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <DashboardLayout title={title}>
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Manage {title.toLowerCase()}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  </DashboardLayout>
);

const PendingProfiles: React.FC = () => {
  const [rows, setRows] = React.useState<MemberDetails[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getPendingProfiles()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  const cols: Column<MemberDetails>[] = [
    { key: 'firstName', header: 'First Name', accessor: 'firstName' },
    { key: 'surname', header: 'Surname', accessor: (r) => r.surname || '-' },
    { key: 'email', header: 'Email', accessor: 'email' },
    { key: 'phoneNumber', header: 'Phone', accessor: 'phoneNumber' },
    { key: 'status', header: 'Status', accessor: (r) => r.status?.statusName || 'PENDING' },
  ];
  return (
    <Section title="Pending Profiles">
      <DataTable
        data={rows}
        columns={cols}
        loading={loading}
        emptyMessage="No pending profiles"
        actions={[
          {
            label: 'Approve',
            variant: 'success',
            onClick: async (item: MemberDetails) => {
              const ipi = window.prompt('Enter IPI number to approve:');
              if (!ipi) return;
              try {
                await adminAPI.approveProfile(item.id, ipi);
                // broadcast update
                try { localStorage.setItem('namsa:update', JSON.stringify({ type: 'profile', userId: item.user?.id || item.id, status: 'APPROVED', timestamp: Date.now() })); } catch (e) {}
                toast({ title: 'Profile approved' });
                reload();
              } catch (e) {
                toast({ title: 'Approval failed', variant: 'destructive' });
              }
            },
            show: (item: MemberDetails) => item.status?.statusName !== 'APPROVED',
          },
          {
            label: 'Reject',
            variant: 'destructive',
            onClick: async (item: MemberDetails) => {
              const notes = window.prompt('Enter rejection notes:') || '';
              try {
                await adminAPI.rejectProfile(item.id, notes);
                try { localStorage.setItem('namsa:update', JSON.stringify({ type: 'profile', userId: item.user?.id || item.id, status: 'REJECTED', timestamp: Date.now() })); } catch (e) {}
                toast({ title: 'Profile rejected' });
                reload();
              } catch (e) {
                toast({ title: 'Rejection failed', variant: 'destructive' });
              }
            },
            show: (item: MemberDetails) => item.status?.statusName !== 'REJECTED',
          },
        ]}
      />
    </Section>
  );
};

const Payments: React.FC = () => {
  const [rows, setRows] = React.useState<ArtistInvoiceReports[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    invoiceAPI.getAllArtistPayments().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  const cols: Column<ArtistInvoiceReports>[] = [
    { key: 'artistName', header: "Member's Name", accessor: 'artistName' },
    { key: 'phone', header: "Member's Phone", accessor: (r) => (r as any).phone || (r as any).artistPhone || '-' },
    { key: 'email', header: "Member's Email", accessor: (r) => (r as any).email || '-' },
    { key: 'totalNetPaid', header: 'Total Net Paid', accessor: (r) => (r as any).totalNetPaid ?? (r as any).totalEarnings ?? 0 },
    { key: 'bankName', header: 'Bank Name', accessor: (r) => (r as any).bankName || '-' },
    { key: 'accountNumber', header: 'Account Number', accessor: (r) => (r as any).accountNumber || (r as any).accountNumber || '-' },
  ];

  const sendPayment = () => {
    setShowPaymentForm(true);
  };

  const exportCSV = (specificRows?: ArtistInvoiceReports[]) => {
    const dataToExport = specificRows || rows;
    if (!dataToExport || dataToExport.length === 0) return;
    const colsArr = ["Member's Name","Member's Phone","Member's Email","Total Net Paid","Bank Name","Account Number"];
    const csvRows = [];
    csvRows.push(colsArr.join(','));
    for (const r of dataToExport) {
      const row: any = r as any;
      const values = [
        row.artistName || '',
        row.phone || row.artistPhone || '',
        row.email || '',
        (row.totalNetPaid ?? row.totalEarnings ?? '') ,
        row.bankName || '',
        row.accountNumber || '',
      ].map((v: any) => (typeof v === 'string' ? `"${v.replace(/"/g,'""')}"` : v));
      csvRows.push(values.join(','));
    }
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `artist_payments_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Section title="Artist Payments">
      <div className="mb-4 flex gap-2">
        <Button onClick={sendPayment} className="hover-scale">
          <Plus className="w-4 h-4 mr-2" /> New Payment
        </Button>
        <Button variant="outline" onClick={() => exportCSV()} className="hover-scale">
          Export CSV
        </Button>
      </div>
      <DataTable data={rows} columns={cols} loading={loading} emptyMessage="No payments" actions={[{ label: 'Export CSV', onClick: (row: ArtistInvoiceReports) => exportCSV([row]) }]} />

      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>New Payment</DialogTitle>
            <DialogDescription>Create a new payment report</DialogDescription>
          </DialogHeader>
          <ArtistPaymentForm asDialog onSuccess={() => setShowPaymentForm(false)} />
        </DialogContent>
      </Dialog>
    </Section>
  );
};

const Invoices: React.FC = () => {
  const [rows, setRows] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const { toast } = useToast();

  const reload = React.useCallback(() => {
    setLoading(true);
    invoiceAPI.getAllInvoices().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { reload(); }, [reload]);

  const cols: Column<Invoice>[] = [
  { key: 'billingTo', header: 'Billing To', accessor: (r) => r.billingToCompanyName || (r as any).billingToName || '-' },
    { key: 'amount', header: 'Amount (N$)', accessor: (r) => {
        const a = (r as any).totalAmount ?? (r as any).totalNetAmount ?? (r as any).amount ?? 0;
        return `N$ ${Number(a).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } },
    { key: 'date', header: 'Date', accessor: (r) => new Date((r as any).invoiceDate || (r as any).createdDate || (r as any).date || Date.now()).toLocaleDateString() },
  ];

  return (
    <DashboardLayout title="Invoices">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>History of invoices sent to clients</CardDescription>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setDialogOpen(true)} className="hover-scale">
              <Plus className="w-4 h-4 mr-2" /> New Invoice
            </Button>
            <Button variant="outline" onClick={() => reload()}>
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <DataTable
            data={rows}
            columns={cols}
            loading={loading}
            emptyMessage="No invoices found"
            actions={[
              { label: 'View', onClick: (r: Invoice) => setSelectedInvoice(r) },
              { label: 'Download', onClick: (r: Invoice) => {
                  const url = (r as any).pdfUrl || (r as any).fileUrl;
                  if (url) window.open(url, '_blank');
                  else toast({ title: 'No file available for this invoice', variant: 'destructive' });
                } },
            ]}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl">
          <InvoiceForm onSuccess={() => { setDialogOpen(false); reload(); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  {/* Invoice number intentionally excluded from details per requirements */}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="font-semibold">{new Date((selectedInvoice as any).invoiceDate || (selectedInvoice as any).createdDate).toLocaleString()}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Billing To</div>
                <div className="font-semibold">{(selectedInvoice as any).billingToCompanyName || (selectedInvoice as any).billingToName || '-'}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Amount (N$)</div>
                <div className="font-semibold">{`N$ ${Number((selectedInvoice as any).totalAmount ?? (selectedInvoice as any).totalNetAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Company (Sender)</div>
                <div className="font-semibold">{(selectedInvoice as any).company?.companyName || (selectedInvoice as any).companyName || 'N/A'}</div>
              </div>

              <div className="flex gap-2 justify-end">
                {((selectedInvoice as any).pdfUrl || (selectedInvoice as any).fileUrl) && (
                  <Button onClick={() => window.open((selectedInvoice as any).pdfUrl || (selectedInvoice as any).fileUrl, '_blank')}>Download PDF</Button>
                )}
                <Button variant="ghost" onClick={() => setSelectedInvoice(null)}>Close</Button>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">No invoice selected.</div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

const LogSheets: React.FC = () => {
  const [rows, setRows] = React.useState<LogSheet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedLogSheet, setSelectedLogSheet] = React.useState<LogSheet | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getAllLogSheets().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  const cols: Column<LogSheet>[] = [
    { key: 'id', header: 'ID', accessor: 'id' },
    { key: 'title', header: 'Name', accessor: (l) => (l as any).logSheetName || (l as any).title || '-' },
    { key: 'company', header: 'Company', accessor: (l) => l.company?.companyName },
    { key: 'createdDate', header: 'Created', accessor: 'createdDate' },
  ];
  return (
    <Section title="All LogSheets">
      <DataTable
        data={rows}
        columns={cols}
        loading={loading}
        emptyMessage="No log sheets"
        actions={[
          {
            label: 'View',
            onClick: async (l: LogSheet) => {
              try {
                const details = await adminAPI.getLogSheetById(l.id);
                setSelectedLogSheet(details);
                setDialogOpen(true);
              } catch {}
            },
          },
        ]}
      />

      {/* LogSheet Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">LogSheet Details</DialogTitle>
          </DialogHeader>
          {selectedLogSheet ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Title</div>
                  <div className="font-semibold">{selectedLogSheet.title}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Company</div>
                  <div className="font-semibold">{selectedLogSheet.company?.companyName || 'Unknown Company'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Created Date</div>
                  <div className="font-semibold">{new Date(selectedLogSheet.createdDate).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Tracks</div>
                  <div className="font-semibold">{selectedLogSheet.selectedMusic?.length || 0}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Selected Tracks</div>
                <div className="space-y-2">
                  {!selectedLogSheet.selectedMusic || selectedLogSheet.selectedMusic.length === 0 ? (
                    <div className="text-muted-foreground">No tracks selected.</div>
                  ) : (
                    <div className="border rounded-lg divide-y">
                      {selectedLogSheet.selectedMusic.map((track) => (
                        <div key={track.id} className="flex items-center justify-between p-4 hover:bg-accent">
                          <div className="flex items-center gap-4 flex-1">
                            <span className="inline-block mr-2">{track.fileType?.toLowerCase().includes('video') ? '🎬' : '🎵'}</span>
                            <div>
                              <div className="font-semibold">{track.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {track.artist || track.user?.name || track.user?.email || 'Unknown Artist'}
                              </div>
                              {track.albumName && (
                                <div className="text-xs text-muted-foreground">Album: {track.albumName}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {track.duration && (
                              <div className="text-sm text-muted-foreground">{track.duration}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Company Details</div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Contact Person</div>
                    <div className="font-semibold">{selectedLogSheet.company?.contactPerson || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="font-semibold">{selectedLogSheet.company?.companyEmail || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Phone</div>
                    <div className="font-semibold">{selectedLogSheet.company?.companyPhone || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Address</div>
                    <div className="font-semibold">{selectedLogSheet.company?.companyAddress || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">LogSheet details not available.</div>
          )}
        </DialogContent>
      </Dialog>
    </Section>
  );
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return <Badge className="bg-namsa-success text-white"><CheckCircle className="w-3 h-3 mr-1" />APPROVED</Badge>;
    case 'REJECTED':
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />REJECTED</Badge>;
    default:
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />PENDING</Badge>;
  }
};

const AllMusic: React.FC = () => {
  const [rows, setRows] = React.useState<ArtistWork[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedMusic, setSelectedMusic] = React.useState<ArtistWork | null>(null);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getAllMusic()
      .then(data => {
        console.log('Music data:', data); // For debugging
        setRows(data);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  // Set up storage event listener to update when status changes
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'namsa:update') {
        try {
          const payload = JSON.parse(e.newValue || '{}');
          if (payload.type === 'music') {
            // Reload to get updated status
            reload();
          }
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [reload]);

  React.useEffect(() => { reload(); }, [reload]);

  const cols: Column<ArtistWork>[] = [
    { key: 'title', header: 'Title', accessor: 'title' },
    { key: 'artist', header: 'Artist', accessor: 'artist' },
    { key: 'genre', header: 'Genre', accessor: (r) => r.artistWorkType?.workTypeName || '-' },
    { key: 'album', header: 'Album', accessor: (r) => r.albumName || '-' },
    { key: 'type', header: 'Type', accessor: (r) => r.artistUploadType?.typeName || '-' },
    { key: 'duration', header: 'Duration', accessor: (r) => r.duration || '-' },
    { key: 'releaseDate', header: 'Release Date', accessor: (r) => r.dateRecorded ? new Date(r.dateRecorded).toLocaleDateString() : new Date(r.uploadedDate).toLocaleDateString() },
    { key: 'isrcCode', header: 'ISRC', accessor: (r) => {
      const isrc = (r as any).isrcCode || (r as any).isrc || '-';
      return isrc;
    }},
    {
      key: 'status',
      header: 'Status',
      accessor: (r) => {
        // Handle all possible undefined/null cases
        if (!r?.status?.statusName) return 'PENDING';
        return String(r.status.statusName).toUpperCase();
      },
      render: (value) => getStatusBadge(String(value || 'PENDING'))
    },
  ];

  const handleView = (music: ArtistWork) => {
    setSelectedMusic(music);
  };

  const handlePlay = (music: ArtistWork) => {
    if (music.fileUrl) {
      const audio = new Audio(music.fileUrl);
      audio.play().catch(console.error);
    }
  };

  return (
    <Section title="All Music">
      <DataTable
        data={rows}
        columns={cols}
        loading={loading}
        emptyMessage="No music"
        actions={[
          { label: 'View', icon: Eye, onClick: handleView },
          { label: 'Play', icon: Play, onClick: handlePlay },
          { label: 'Download', icon: Download, onClick: (m) => {
            if (m.fileUrl) {
              const link = document.createElement('a');
              link.href = m.fileUrl;
              link.download = `${m.title}.${m.fileType || 'mp3'}`;
              link.click();
            }
          } },
        ]}
      />

      <Dialog open={!!selectedMusic} onOpenChange={() => setSelectedMusic(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Music Details</DialogTitle>
          </DialogHeader>
          {selectedMusic && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Track Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label>Title</Label>
                    <Input value={selectedMusic.title} disabled />
                  </div>
                  <div>
                    <Label>Artist</Label>
                    <Input value={selectedMusic.artist || '-'} disabled />
                  </div>
                  <div>
                    <Label>Album</Label>
                    <Input value={selectedMusic.albumName || '-'} disabled />
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Input value={selectedMusic.duration || '-'} disabled />
                  </div>
                  <div>
                    <Label>Genre</Label>
                    <Input value={selectedMusic.artistWorkType?.workTypeName || '-'} disabled />
                  </div>
                  <div>
                    <Label>Upload Type</Label>
                    <Input value={selectedMusic.artistUploadType?.typeName || '-'} disabled />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold">File Actions</h3>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handlePlay(selectedMusic)} className="gap-2">
                    <Play className="h-4 w-4" /> Play
                  </Button>
                  <Button variant="outline" onClick={() => {
                    if (selectedMusic.fileUrl) {
                      const link = document.createElement('a');
                      link.href = selectedMusic.fileUrl;
                      link.download = selectedMusic.title;
                      link.click();
                    }
                  }} className="gap-2">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Section>
  );
};

const Admins: React.FC = () => {
  const [rows, setRows] = React.useState<AdminType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    email: '',
    password: '',
    name: '',
    role: 'ADMIN',
  });
  const [editingAdmin, setEditingAdmin] = React.useState<AdminType | null>(null);
  const [editForm, setEditForm] = React.useState({ name: '', role: 'ADMIN' });
  const [savingEdit, setSavingEdit] = React.useState(false);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getAllAdmins().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  const cols: Column<AdminType>[] = [
    { key: 'id', header: 'ID', accessor: 'id' },
    { key: 'name', header: 'Name', accessor: 'name' },
    { key: 'role', header: 'Role', accessor: 'role' },
    { key: 'email', header: 'Email', accessor: (a) => a.user?.email },
  ];

  const handleCreate = async () => {
    if (!createForm.email || !createForm.password || !createForm.name) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    try {
      setCreating(true);
      await adminAPI.createAdmin(createForm);
      toast({ title: 'Admin created' });
      setShowCreateDialog(false);
      setCreateForm({ email: '', password: '', name: '', role: 'ADMIN' });
      reload();
    } catch {
      toast({ title: 'Create failed', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (a: AdminType) => {
    setEditingAdmin(a);
    setEditForm({ name: a.name || '', role: a.role || 'ADMIN' });
  };

  const handleSaveEdit = async () => {
    if (!editingAdmin) return;
    try {
      setSavingEdit(true);
      await adminAPI.updateAdmin(editingAdmin.id, { name: editForm.name, role: editForm.role });
      toast({ title: 'Admin updated' });
      setEditingAdmin(null);
      reload();
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <Section title="All Admins">
      <div className="mb-4">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="hover-scale">
              <Plus className="w-4 h-4 mr-2" /> New Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Admin</DialogTitle>
              <DialogDescription>Enter admin details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Enter temporary password"
                />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Admin full name"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={createForm.role} onValueChange={(v) => setCreateForm((p) => ({ ...p, role: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={creating} className="flex-1">
                  {creating ? 'Creating...' : 'Create Admin'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        data={rows}
        columns={cols}
        loading={loading}
        emptyMessage="No admins"
        actions={[
          {
            label: 'Edit',
            onClick: openEdit,
          },
          {
            label: 'Delete',
            variant: 'destructive',
            onClick: async (a: AdminType) => {
              if (!window.confirm('Delete this admin?')) return;
              try {
                await adminAPI.deleteAdmin(a.id);
                toast({ title: 'Admin deleted' });
                reload();
              } catch {
                toast({ title: 'Delete failed', variant: 'destructive' });
              }
            },
          },
        ]}
      />

      {/* Edit Admin Dialog */}
      <Dialog open={!!editingAdmin} onOpenChange={() => setEditingAdmin(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>Update admin info</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm((p) => ({ ...p, role: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingAdmin(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={savingEdit} className="flex-1">
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Section>
  );
};

const PendingMusic: React.FC = () => {
  const [rows, setRows] = React.useState<ArtistWork[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getPendingMusic()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  const cols: Column<ArtistWork>[] = [
    { key: 'title', header: 'Title', accessor: 'title' },
    { key: 'artist', header: 'Artist', accessor: 'artist' },
    { key: 'uploadedDate', header: 'Uploaded', accessor: 'uploadedDate' },
    { key: 'status', header: 'Status', accessor: (r) => r.status?.statusName || 'PENDING' },
  ];
  return (
    <Section title="Pending Music">
      <DataTable
        data={rows}
        columns={cols}
        loading={loading}
        emptyMessage="No pending music"
        actions={[
          {
            label: 'Approve',
            variant: 'success',
            onClick: async (item: ArtistWork) => {
              const isrc = window.prompt('Enter ISRC code to approve:');
              if (!isrc) return;
              try {
                await adminAPI.approveMusic(item.id, isrc);
                toast({ title: 'Music approved' });
                reload();
              } catch (e) {
                toast({ title: 'Approval failed', variant: 'destructive' });
              }
            },
            show: (item: ArtistWork) => item.status?.statusName !== 'APPROVED',
          },
          {
            label: 'Reject',
            variant: 'destructive',
            onClick: async (item: ArtistWork) => {
              const notes = window.prompt('Enter rejection notes:') || '';
              try {
                await adminAPI.rejectMusic(item.id, notes);
                toast({ title: 'Music rejected' });
                reload();
              } catch (e) {
                toast({ title: 'Rejection failed', variant: 'destructive' });
              }
            },
            show: (item: ArtistWork) => item.status?.statusName !== 'REJECTED',
          },
        ]}
      />
    </Section>
  );
};

const AllUsers: React.FC = () => {
  const [rows, setRows] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getAllUsers().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  const cols: Column<User>[] = [
    { key: 'id', header: 'ID', accessor: 'id' },
    { key: 'email', header: 'Email', accessor: 'email' },
    { key: 'role', header: 'Role', accessor: 'role' },
    { key: 'isEnabled', header: 'Enabled', accessor: (u) => (u.isEnabled ? 'Yes' : 'No') },
  ];
  const artists = rows.filter((u) => u.role === 'ARTIST');
  const companies = rows.filter((u) => u.role === 'COMPANY');
  const admins = rows.filter((u) => u.role === 'ADMIN');
  return (
    <DashboardLayout title="Users">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Browse all Members</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={artists} columns={cols} loading={loading} emptyMessage="No Members" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Music Users</CardTitle>
            <CardDescription>Manage Music Users</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={companies}
              columns={cols}
              loading={loading}
              emptyMessage="No Music Users"
              actions={[
                {
                  label: 'Edit',
                  onClick: async (user: User) => {
                    const email = window.prompt('Email:', user.email) || user.email;
                    try {
                      await adminAPI.updateUser(user.id, { email });
                      toast({ title: 'User updated' });
                      reload();
                    } catch {
                      toast({ title: 'Update failed', variant: 'destructive' });
                    }
                  },
                },
                {
                  label: 'Toggle Enable',
                  onClick: async (user: User) => {
                    try {
                      await adminAPI.updateUser(user.id, { isEnabled: !user.isEnabled });
                      toast({ title: 'User updated' });
                      reload();
                    } catch {
                      toast({ title: 'Update failed', variant: 'destructive' });
                    }
                  },
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admins</CardTitle>
            <CardDescription>Manage admins</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={admins}
              columns={cols}
              loading={loading}
              emptyMessage="No admins"
              actions={[
                {
                  label: 'Edit',
                  onClick: async (user: User) => {
                    const email = window.prompt('Email:', user.email) || user.email;
                    try {
                      await adminAPI.updateUser(user.id, { email });
                      toast({ title: 'User updated' });
                      reload();
                    } catch {
                      toast({ title: 'Update failed', variant: 'destructive' });
                    }
                  },
                },
                {
                  label: 'Toggle Enable',
                  onClick: async (user: User) => {
                    try {
                      await adminAPI.updateUser(user.id, { isEnabled: !user.isEnabled });
                      toast({ title: 'User updated' });
                      reload();
                    } catch {
                      toast({ title: 'Update failed', variant: 'destructive' });
                    }
                  },
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const Companies: React.FC = () => {
  const [rows, setRows] = React.useState<Company[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingCompany, setEditingCompany] = React.useState<Company | null>(null);
  const [editForm, setEditForm] = React.useState<Partial<Company>>({});
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    email: '',
    password: '',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    contactPerson: '',
  });
  const [saving, setSaving] = React.useState(false);
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getAllCompanies().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setEditForm({
      companyName: company.companyName,
      companyEmail: company.companyEmail,
      companyPhone: company.companyPhone,
      companyAddress: company.companyAddress,
      contactPerson: company.contactPerson,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCompany) return;
    try {
      setSaving(true);
      await adminAPI.updateCompany(editingCompany.id, editForm);
      toast({ title: 'Company updated' });
      setEditingCompany(null);
      reload();
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    try {
      setSaving(true);
      await adminAPI.createCompany(createForm);
      toast({ title: 'Company created' });
      setShowCreateDialog(false);
      setCreateForm({
        email: '',
        password: '',
        companyName: '',
        companyEmail: '',
        companyPhone: '',
        companyAddress: '',
        contactPerson: '',
      });
      reload();
    } catch {
      toast({ title: 'Create failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const cols: Column<Company>[] = [
    { key: 'id', header: 'ID', accessor: 'id' },
    { key: 'companyName', header: 'Name', accessor: 'companyName' },
    { key: 'companyEmail', header: 'Email', accessor: 'companyEmail' },
    { key: 'companyPhone', header: 'Phone', accessor: 'companyPhone' },
    { key: 'contactPerson', header: 'Contact', accessor: 'contactPerson' },
  ];

  return (
    <Section title="All Companies">
      <div className="mb-4">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="hover-scale">
              <Plus className="w-4 h-4 mr-2" /> New Music User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Music User</DialogTitle>
              <DialogDescription>Enter the company details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Login Email</Label>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter temporary password"
                />
              </div>
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  value={createForm.companyName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>
            <div className="space-y-2">
                <Label>Company Email</Label>
                <Input
                  type="email"
                  value={createForm.companyEmail}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, companyEmail: e.target.value }))}
                  placeholder="info@company.com"
                />
              </div>
            <div className="space-y-2">
              <Label>Company Phone</Label>
              <Input
                value={createForm.companyPhone}
                onChange={(e) => setCreateForm(prev => ({ ...prev, companyPhone: e.target.value }))}
                placeholder="+1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label>Company Address</Label>
              <Input
                value={createForm.companyAddress}
                onChange={(e) => setCreateForm(prev => ({ ...prev, companyAddress: e.target.value }))}
                placeholder="123 Main St, City"
              />
            </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  value={createForm.contactPerson}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Enter contact person name"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={saving} className="flex-1">
                  {saving ? 'Creating...' : 'Create Company'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        data={rows}
        columns={cols}
        loading={loading}
        emptyMessage="No Music Users"
        actions={[
          {
            label: 'Edit',
            icon: Edit,
            onClick: handleEdit,
          },
          {
            label: 'Delete',
            icon: Trash2,
            variant: 'destructive',
            onClick: async (c: Company) => {
              if (!window.confirm('Delete this company?')) return;
              try {
                await adminAPI.deleteCompany(c.id);
                toast({ title: 'Company deleted' });
                reload();
              } catch {
                toast({ title: 'Delete failed', variant: 'destructive' });
              }
            },
          },
        ]}
      />

      {/* Edit Company Dialog */}
      <Dialog open={!!editingCompany} onOpenChange={() => setEditingCompany(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update company information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={editForm.companyName || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, companyName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Company Email</Label>
              <Input
                type="email"
                value={editForm.companyEmail || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, companyEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Company Phone</Label>
              <Input
                value={editForm.companyPhone || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, companyPhone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Company Address</Label>
              <Input
                value={editForm.companyAddress || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, companyAddress: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input
                value={editForm.contactPerson || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, contactPerson: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingCompany(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={saving} className="flex-1">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Section>
  );
};

const ApprovedProfiles: React.FC = () => {
  const [rows, setRows] = React.useState<MemberDetails[]>([]);
  const [loading, setLoading] = React.useState(true);
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getAllProfiles()
      .then((data) => setRows(data.filter((r: any) => r.status?.statusName === 'APPROVED')))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);

  const cols: Column<MemberDetails>[] = [
    { key: 'firstName', header: 'First Name', accessor: 'firstName' },
    { key: 'surname', header: 'Surname', accessor: (r) => r.surname || '-' },
    { key: 'artistId', header: 'Artist ID', accessor: (r) => (r as any).artistId || (r as any).ArtistId || '-' },
    { key: 'email', header: 'Email', accessor: 'email' },
    { key: 'ipi', header: 'IPI', accessor: (r) => (r as any).ipi_number || (r as any).IPI_number || (r as any).ipiNumber || '-' },
    { key: 'phoneNumber', header: 'Phone', accessor: 'phoneNumber' },
  ];

  return (
    <Section title="Approved Profiles">
      <DataTable data={rows} columns={cols} loading={loading} emptyMessage="No approved profiles" />
    </Section>
  );
};

const RejectedProfiles: React.FC = () => {
  const [rows, setRows] = React.useState<MemberDetails[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editOpen, setEditOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<MemberDetails | null>(null);
  const [newStatus, setNewStatus] = React.useState<'PENDING'|'APPROVED'|'REJECTED'>('PENDING');
  const { toast } = useToast();
  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getAllProfiles()
      .then((data) => setRows(data.filter((r: any) => r.status?.statusName === 'REJECTED')))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);

  const cols: Column<MemberDetails>[] = [
    { key: 'firstName', header: 'First Name', accessor: 'firstName' },
    { key: 'surname', header: 'Surname', accessor: (r) => r.surname || '-' },
    { key: 'artistId', header: 'Artist ID', accessor: (r) => (r as any).artistId || (r as any).ArtistId || '-' },
    { key: 'email', header: 'Email', accessor: 'email' },
    { key: 'phoneNumber', header: 'Phone', accessor: 'phoneNumber' },
    { key: 'status', header: 'Status', accessor: (r) => r.status?.statusName || r.status?.status || '-' },
  ];

  const openEdit = (item: MemberDetails) => {
    setSelected(item);
    const s = (item.status?.statusName || 'REJECTED') as 'PENDING'|'APPROVED'|'REJECTED';
    setNewStatus(s);
    setEditOpen(true);
  };

  const saveStatus = async () => {
    if (!selected) return;
    try {
      const statusId = (selected.status as any)?.id || (selected as any).statusId;
      if (!statusId) throw new Error('Missing status id');
      await statusAPI.updateStatus(statusId, newStatus);
      try { localStorage.setItem('namsa:update', JSON.stringify({ type: 'profile', userId: selected.user?.id || selected.id, status: newStatus, timestamp: Date.now() })); } catch (e) {}
      toast({ title: 'Status updated' });
      setEditOpen(false);
      setSelected(null);
      reload();
    } catch (e) {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  return (
    <Section title="Rejected Profiles">
      <DataTable
        data={rows}
        columns={cols}
        loading={loading}
        emptyMessage="No rejected profiles"
        actions={[
          { label: 'View Profile', onClick: async (profile: MemberDetails) => {
            try {
              const details = await adminAPI.getUserDocuments(profile.user?.id || profile.id);
              window.alert(`Profile: ${profile.firstName} ${profile.surname}\nDocs: ${Object.keys(details||{}).join(', ')}`);
            } catch {}
          } },
          { label: 'Edit Status', onClick: openEdit },
        ]}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Status</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded">
                <div className="font-medium">{selected.firstName} {selected.surname}</div>
                <div className="text-sm text-muted-foreground">{selected.email}</div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="APPROVED">APPROVED</SelectItem>
                    <SelectItem value="REJECTED">REJECTED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1">Cancel</Button>
                <Button onClick={saveStatus} className="flex-1">Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Section>
  );
};


const ArtistsList: React.FC = () => {
  const [rows, setRows] = React.useState<MemberDetails[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [selectedProfile, setSelectedProfile] = React.useState<MemberDetails | null>(null);
  const [profileDetails, setProfileDetails] = React.useState<any>(null);
  const [viewOpen, setViewOpen] = React.useState(false);

  const reload = React.useCallback(() => {
    setLoading(true);
    adminAPI.getAllProfiles().then(setRows).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { reload(); }, [reload]);
  const cols: Column<MemberDetails>[] = [
    { key: 'firstName', header: 'First Name', accessor: 'firstName', sortable: true },
    { key: 'surname', header: 'Surname', accessor: (r) => r.surname || '-' },
    { key: 'artistId', header: 'Artist ID', accessor: (r) => (r as any).artistId || (r as any).ArtistId || '-' },
    { key: 'email', header: 'Email', accessor: 'email' },
    { key: 'phoneNumber', header: 'Phone', accessor: 'phoneNumber' },
    { key: 'status', header: 'Status', accessor: (r) => r.status?.statusName || r.status?.status || '-' },
    { key: 'ipi', header: 'IPI', accessor: (r) => (r as any).ipi_number || (r as any).IPI_number || (r as any).ipiNumber || '-' },
  ];
  const filtered = React.useMemo(() => {
    if (statusFilter === 'ALL') return rows;
    return rows.filter((r) => (r.status?.statusName || '-') === statusFilter);
  }, [rows, statusFilter]);

  const handleView = async (profile: MemberDetails) => {
    try {
      setSelectedProfile(profile);
      setProfileDetails(null);
      setViewOpen(true);
      const details = await adminAPI.getUserDocuments(profile.user?.id || profile.id);
      setProfileDetails(details);
    } catch (err) {
      // ignore
    }
  };

  return (
    <DashboardLayout title="All members">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>All Members</CardTitle>
              <CardDescription>Browse and search all  members</CardDescription>
            </div>
            <div className="w-44">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable data={filtered} columns={cols} loading={loading} emptyMessage="No Members found" actions={[{ label: 'View Profile', onClick: handleView }]} />
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={(o) => { setViewOpen(o); if (!o) { setSelectedProfile(null); setProfileDetails(null); } }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Details</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Member Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label>First Name</Label>
                    <Input value={profileDetails?.memberDetails?.firstName || selectedProfile.firstName} disabled />
                  </div>
                  <div>
                    <Label>Surname</Label>
                    <Input value={profileDetails?.memberDetails?.surname || selectedProfile.surname} disabled />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={profileDetails?.memberDetails?.email || selectedProfile.email} disabled />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={profileDetails?.memberDetails?.phoneNumber || selectedProfile.phoneNumber} disabled />
                  </div>
                  <div>
                    <Label>Artist ID</Label>
                    <Input value={profileDetails?.memberDetails?.artistId || (selectedProfile as any).artistId || '-'} disabled />
                  </div>
                  <div>
                    <Label>IPI Number</Label>
                    <Input value={profileDetails?.memberDetails?.ipi_number || (selectedProfile as any).ipi_number || '-'} disabled />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold">Uploaded Documents</h3>
                <div className="space-y-4 mt-2">
                  {profileDetails?.passportphoto ? (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Passport Photo</p>
                        <p className="text-sm text-muted-foreground">{profileDetails.passportphoto.imageTitle}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => window.open(profileDetails.passportphoto.imageUrl, '_blank')}>View</Button>
                    </div>
                  ) : (<div className="text-muted-foreground">No passport photo</div>)}

                  {profileDetails?.idDocument ? (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">ID Document</p>
                        <p className="text-sm text-muted-foreground">{profileDetails.idDocument.documentTitle}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => window.open(profileDetails.idDocument.fileUrl, '_blank')}>View</Button>
                    </div>
                  ) : (<div className="text-muted-foreground">No ID document</div>)}

                  {profileDetails?.bankConfirmationLetter ? (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Bank Confirmation Letter</p>
                        <p className="text-sm text-muted-foreground">{profileDetails.bankConfirmationLetter.documentTitle}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => window.open(profileDetails.bankConfirmationLetter.fileUrl, '_blank')}>View</Button>
                    </div>
                  ) : (<div className="text-muted-foreground">No bank confirmation letter</div>)}

                  {profileDetails?.proofOfPayment ? (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Proof of Payment</p>
                        <p className="text-sm text-muted-foreground">{profileDetails.proofOfPayment.documentTitle}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => window.open(profileDetails.proofOfPayment.fileUrl, '_blank')}>View</Button>
                    </div>
                  ) : (<div className="text-muted-foreground">No proof of payment</div>)}

                </div>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="stats" element={<AdminDashboard />} />
      <Route path="profiles/pending" element={<AdminPendingProfiles />} />
      <Route path="profiles/approved" element={<ApprovedProfiles />} />
      <Route path="profiles/rejected" element={<RejectedProfiles />} />
      <Route path="music/pending" element={<AdminPendingMusic />} />
      <Route path="licenses" element={<AdminLicenseApplications />} />
      <Route path="artists" element={<ArtistsList />} />
      <Route path="users" element={<AllUsers />} />
      <Route path="companies" element={<Companies />} />
      <Route path="admins" element={<Admins />} />
      <Route path="music" element={<AllMusic />} />
      <Route path="logsheets" element={<LogSheets />} />
      <Route path="performance" element={<AdminPerformance />} />
      <Route path="invoices" element={<Invoices />} />
      <Route path="invoices/new" element={<InvoiceForm />} />
      <Route path="payments" element={<Payments />} />
      <Route path="payments/new" element={<ArtistPaymentForm asDialog={false} />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
};

export default AdminRoutes;
