import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/common/StatsCard';
import { artistAPI } from '@/services/api';
import { ArtistStats } from '@/types';
import { Music, CheckCircle, FileText, BarChart3 } from 'lucide-react';

const ArtistStats: React.FC = () => {
  const [stats, setStats] = useState<ArtistStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await artistAPI.getStats().catch(() => ({
          totalUploaded: 0,
          totalApproved: 0,
          totalPending: 0,
          totalRejected: 0,
        } as any));
        setStats(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Statistics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Statistics">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Uploaded" value={stats?.totalUploaded || 0} description="Your tracks" icon={Music} />
        <StatsCard title="Approved" value={stats?.totalApproved || 0} description="Greenlit" icon={CheckCircle} />
        <StatsCard title="Pending" value={stats?.totalPending || 0} description="Awaiting review" icon={FileText} />
        <StatsCard title="Rejected" value={stats?.totalRejected || 0} description="See notes" icon={BarChart3} />
      </div>
    </DashboardLayout>
  );
};

export default ArtistStats;

