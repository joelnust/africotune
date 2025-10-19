import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter
} from 'recharts';
import { LogSheet, ArtistWork } from '@/types';

interface PerformanceChartsProps {
  logSheets: LogSheet[];
  tracks: ArtistWork[];
  userId?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ logSheets, tracks, userId }) => {
  const performanceData = useMemo(() => {
    const trackMap: Record<
      number,
      {
        title: string;
        totalSelections: number;
        companies: Record<string, number>;
        timeline: Record<string, number>;
      }
    > = {};

    const companyMap: Record<string, number> = {};
    const timelineMap: Record<string, number> = {};
    const selectionCountsMap: Record<number, number> = {}; // For histogram data

    for (const sheet of logSheets) {
      const companyName = sheet.company?.companyName || 'Unknown';
      const date = new Date(sheet.createdDate).toLocaleDateString();

      for (const music of sheet.selectedMusic || []) {
        const mid = (music as any).id;
        const musicUserId = (music as any).user?.id;

        // Skip if music doesn't belong to the specified user
      if (userId && musicUserId !== userId) continue;

        // Only create entry if this is one of our tracks
        if (tracks.some(t => t.id === mid) && !trackMap[mid]) {
          trackMap[mid] = {
            title: (music as any).title || `Track ${mid}`,
            totalSelections: 0,
            companies: {},
            timeline: {}
          };
        }

        trackMap[mid].totalSelections += 1;
        trackMap[mid].companies[companyName] = (trackMap[mid].companies[companyName] || 0) + 1;
        trackMap[mid].timeline[date] = (trackMap[mid].timeline[date] || 0) + 1;

        companyMap[companyName] = (companyMap[companyName] || 0) + 1;
        timelineMap[date] = (timelineMap[date] || 0) + 1;
      }
    }

    const allTracks = Object.entries(trackMap)
      .map(([id, data]) => ({ id: parseInt(id), ...data }))
      .sort((a, b) => b.totalSelections - a.totalSelections);

    const topTracks = allTracks.slice(0, 10);

    const companyData = Object.entries(companyMap).map(([name, count]) => ({ name, count }));

    const timelineData = Object.entries(timelineMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);

    // Calculate selection frequency for histogram
    const selectionsPerDay = Object.values(timelineMap);
    const frequencyMap: Record<number, number> = {};
    selectionsPerDay.forEach(count => {
      frequencyMap[count] = (frequencyMap[count] || 0) + 1;
    });
    const histogramData = Object.entries(frequencyMap)
      .map(([value, frequency]) => ({ value: parseInt(value), frequency }))
      .sort((a, b) => a.value - b.value);

    return {
      topTracks,
      allTracks,
      companyData,
      timelineData,
      histogramData,
      totalSelections: Object.values(trackMap).reduce((sum, t) => sum + t.totalSelections, 0)
    };
  }, [logSheets, userId]);

  if (performanceData.totalSelections === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No performance data available yet. Your music needs to be selected in log sheets to see statistics.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Selections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{performanceData.totalSelections}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Tracks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{performanceData.allTracks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{performanceData.companyData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Track</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{performanceData.topTracks[0]?.title || '-'}</div>
            <p className="text-xs text-muted-foreground">{performanceData.topTracks[0]?.totalSelections || 0} selections</p>
          </CardContent>
        </Card>
      </div>

      {/* 1) Sparkbars per track (mini historic bar charts) */}
      <Card>
        <CardHeader>
          <CardTitle>Track Activity (Sparkbars)</CardTitle>
          <CardDescription>Mini trends of selections over time for each top track</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performanceData.topTracks.map((track) => {
              const data = Object.entries(track.timeline)
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(-20);
              return (
                <div key={track.id} className="flex items-center gap-4">
                  <div className="w-40 truncate text-sm font-medium">{track.title}</div>
                  <div className="flex-1" style={{ width: '100%', height: 50 }}>
                    <ResponsiveContainer width="100%" height={50}>
                      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <Bar dataKey="count" fill="#82CA9D" radius={[2,2,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-24 text-right text-sm text-muted-foreground">{track.totalSelections} total</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selection Distribution Histogram */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Selections Distribution</CardTitle>
          <CardDescription>Frequency distribution of daily selection counts</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={performanceData.histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="value" label={{ value: 'Selections per Day', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="frequency" fill="#8884d8" name="Frequency">
                  {performanceData.histogramData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Line chart — performance trend (global) */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Selections over time (last 30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={performanceData.timelineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0088FE" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 3) Pie chart — plays distribution by company */}
      <Card>
        <CardHeader>
          <CardTitle>Plays Distribution by Company</CardTitle>
          <CardDescription>Which companies contribute most to selections</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={performanceData.companyData} dataKey="count" nameKey="name" outerRadius={90} labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                  {performanceData.companyData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 4) Horizontal bars — top tracks and top companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Tracks</CardTitle>
            <CardDescription>Top 5 tracks by selections</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart 
                  data={(() => {
                    // Create histogram data for selections
                    const values = performanceData.topTracks.map(t => t.totalSelections);
                    const max = Math.max(...values);
                    const min = Math.min(...values);
                    const binCount = 10;
                    const binSize = (max - min) / binCount;
                    
                    const bins = new Array(binCount).fill(0);
                    values.forEach(value => {
                      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
                      bins[binIndex]++;
                    });
                    
                    return bins.map((count, i) => ({
                      range: `${Math.round(min + i * binSize)}-${Math.round(min + (i + 1) * binSize)}`,
                      count
                    }));
                  })()}
                  margin={{ top: 10, right: 20, left: 60, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" angle={-45} textAnchor="end" height={60} />
                  <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884D8">
                    {performanceData.topTracks.slice(0, 5).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Companies</CardTitle>
            <CardDescription>Top 5 companies by selections</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart 
                  data={(() => {
                    // Create histogram data for company selections
                    const values = performanceData.companyData.map(c => c.count);
                    const max = Math.max(...values);
                    const min = Math.min(...values);
                    const binCount = 8;
                    const binSize = (max - min) / binCount;
                    
                    const bins = new Array(binCount).fill(0);
                    values.forEach(value => {
                      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
                      bins[binIndex]++;
                    });
                    
                    return bins.map((count, i) => ({
                      range: `${Math.round(min + i * binSize)}-${Math.round(min + (i + 1) * binSize)}`,
                      count
                    }));
                  })()}
                  margin={{ top: 10, right: 20, left: 60, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" angle={-45} textAnchor="end" height={60} />
                  <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00C49F">
                    {performanceData.companyData.slice(0, 5).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5) Donut chart — artist vs others */}
      <Card>
        <CardHeader>
          <CardTitle>Artist vs Others</CardTitle>
          <CardDescription>Proportion of selections attributed to the current artist vs everyone else</CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            // Compute artist vs others from provided userId
            const total = performanceData.totalSelections;
            let artistTotal = 0;
            if (userId) {
              for (const sheet of logSheets) {
                for (const m of sheet.selectedMusic || []) {
                  const uid = (m as any).user?.id;
                  if (uid === userId) artistTotal += 1;
                }
              }
            }
            const data = [
              { name: 'This Artist', value: artistTotal },
              { name: 'Others', value: Math.max(0, total - artistTotal) },
            ];
            return (
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label>
                      {data.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? '#0088FE' : '#E5E7EB'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceCharts;
