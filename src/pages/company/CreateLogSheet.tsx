import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable, { Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { companyAPI } from '@/services/api';
import { ArtistWork } from '@/types';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';

const CreateLogSheet: React.FC = () => {
  const [name, setName] = useState('');
  const [availableMusic, setAvailableMusic] = useState<ArtistWork[]>([]);
  const [selectedMusicIds, setSelectedMusicIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadMusic = async () => {
      try {
        setLoading(true);
        const data = await companyAPI.getApprovedMusic();
        setAvailableMusic(data);
      } catch (error) {
        console.error('Failed to load music:', error);
        toast({
          title: "Error",
          description: "Failed to load available music",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMusic();
  }, [toast]);

  const handleMusicSelection = (musicId: number, checked: boolean) => {
    if (checked) {
      setSelectedMusicIds(prev => [...prev, musicId]);
    } else {
      setSelectedMusicIds(prev => prev.filter(id => id !== musicId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a log sheet name",
        variant: "destructive",
      });
      return;
    }

    if (selectedMusicIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one music track",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      await companyAPI.createLogSheet(name.trim(), selectedMusicIds);
      
      toast({
        title: "Success",
        description: "Log sheet created successfully",
      });
      
      navigate('/company/logsheets');
    } catch (error) {
      console.error('Failed to create log sheet:', error);
      toast({
        title: "Error",
        description: "Failed to create log sheet",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const columns: Column<ArtistWork>[] = [
    {
      key: 'id',
      header: 'Select',
      accessor: 'id',
      render: (value, row) => (
        <Checkbox
          checked={selectedMusicIds.includes(value)}
          onCheckedChange={(checked) => handleMusicSelection(value, checked as boolean)}
        />
      ),
    },
    {
      key: 'title',
      header: 'Title',
      accessor: 'title',
      className: 'font-medium',
    },
    {
      key: 'artist',
      header: 'Artist',
      accessor: 'artist',
    },
    {
      key: 'artistWorkType',
      header: 'Genre',
      accessor: (item) => item.artistWorkType?.workTypeName || '-',
    },
    {
      key: 'duration',
      header: 'Duration',
      accessor: 'duration',
      render: (value) => value || 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <Badge variant="default" className="bg-namsa-success text-white">
          {value?.statusName || 'Approved'}
        </Badge>
      ),
    },
  ];

  return (
    <DashboardLayout title="Create Log Sheet">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/company/logsheets')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Log Sheets
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Log Sheet</h1>
            <p className="text-muted-foreground">
              Select music tracks to include in your log sheet
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Log Sheet Details
              </CardTitle>
              <CardDescription>
                Enter the basic information for your log sheet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Log Sheet Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter log sheet name..."
                  required
                />
              </div>
              
              <div className="text-sm text-muted-foreground">
                Selected tracks: {selectedMusicIds.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Music Tracks</CardTitle>
              <CardDescription>
                Choose the music tracks to include in this log sheet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={availableMusic}
                columns={columns}
                loading={loading}
                searchable={true}
                emptyMessage="No approved music available"
                showPagination={true}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/company/logsheets')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Log Sheet'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateLogSheet;