import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { adminAPI, artistAPI } from '@/services/api';
import { LogSheet, ArtistWork } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import MusicPlayerDialog from '@/components/common/MusicPlayerDialog';
import VideoPlayerDialog from '@/components/common/VideoPlayerDialog';
import { FileMusic, Video, Play } from 'lucide-react';

const ArtistPerformance: React.FC = () => {
  const [myTracks, setMyTracks] = useState<ArtistWork[]>([]);
  const [logSheets, setLogSheets] = useState<LogSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<ArtistWork | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [selectedLogSheet, setSelectedLogSheet] = useState<LogSheet | null>(null);
  const [logSheetDialogOpen, setLogSheetDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Get artist's music and ALL logsheets from all companies
        const [myMusic, allLogSheets] = await Promise.all([
          artistAPI.getMyMusic().catch(() => []),
          adminAPI.getAllLogSheets().catch(() => []),
        ]);
        
        // Create set of artist's track IDs
        const myTrackIds = new Set(myMusic.map((m: any) => m.id));
        
        // Filter logsheets to only those containing this artist's music
        const filteredSheets = allLogSheets.filter(sheet => 
          sheet.selectedMusic?.some(music => myTrackIds.has((music as any).id))
        );
        
        setMyTracks(myMusic);
        setLogSheets(filteredSheets);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load performance data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key !== 'namsa:update') return;
      try {
        const payload = JSON.parse(e.newValue || '{}');
        if (payload?.type === 'music' || payload?.type === 'profile') {
          load();
          toast({ title: 'Performance Data Updated' });
        }
      } catch (err) {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [toast]);

  // Aggregate data exactly like admin panel - song counts, artist counts, company counts
  const {
    songCounts,
    artistCounts,
    companyCounts,
    companySheetsMap,
    companySelectedCountMap,
  } = useMemo(() => {
    const songMap: Record<number, { title: string; count: number; track?: ArtistWork; companies: Record<string, number>; artistName?: string }> = {};
    const artistMap: Record<string, { name: string; count: number }> = {};
    const companyMap: Record<string, { sheets: number; selectedMusic: number }> = {};
    const companySheetsMap: Record<string, LogSheet[]> = {};

    for (const sheet of logSheets) {
      const companyName = sheet.company?.companyName || 'Unknown Company';
      companyMap[companyName] = companyMap[companyName] || { sheets: 0, selectedMusic: 0 };
      companyMap[companyName].sheets += 1;
      companySheetsMap[companyName] = companySheetsMap[companyName] || [];
      companySheetsMap[companyName].push(sheet);

      for (const m of sheet.selectedMusic || []) {
        const id = (m as any).id;
        if (!id) continue;
        const title = (m as any).title || `Track ${id}`;
        const artistName = (m as any).user?.name || (m as any).artist || (m as any).user?.email || 'Unknown Artist';

        if (!songMap[id]) songMap[id] = { title, count: 0, track: m as any, companies: {}, artistName };
        songMap[id].count += 1;
        songMap[id].companies[companyName] = (songMap[id].companies[companyName] || 0) + 1;

        artistMap[artistName] = artistMap[artistName] || { name: artistName, count: 0 };
        artistMap[artistName].count += 1;

        companyMap[companyName].selectedMusic += 1;
      }
    }

    return {
      songCounts: Object.entries(songMap).map(([id, v]) => ({ id: parseInt(id), title: v.title, count: v.count, companies: v.companies, artistName: v.artistName, track: v.track })),
      artistCounts: Object.entries(artistMap).map(([k, v]) => ({ name: v.name, count: v.count })),
      companyCounts: Object.entries(companyMap).map(([company, v]) => ({ company, sheets: v.sheets, selectedMusic: v.selectedMusic })),
      companySheetsMap,
      companySelectedCountMap: Object.fromEntries(Object.entries(companyMap).map(([c, v]) => [c, v.selectedMusic])) as Record<string, number>,
    } as any;
  }, [logSheets]);

  const tracksList = useMemo(() => {
    const list = songCounts.map((s: any) => ({ id: s.id, title: s.title }));
    return list.sort((a: any, b: any) => a.title.localeCompare(b.title));
  }, [songCounts]);

  const filteredTracks = useMemo(() => {
    if (!search.trim()) return tracksList;
    const q = search.toLowerCase();
    return tracksList.filter((t: any) => t.title.toLowerCase().includes(q));
  }, [tracksList, search]);

  const selectedCompanyData = useMemo(() => {
    if (!selectedTrackId) return [] as { company: string; count: number }[];
    const map: Record<string, number> = {};
    for (const sheet of logSheets) {
      const companyName = sheet.company?.companyName || 'Unknown Company';
      for (const m of sheet.selectedMusic || []) {
        const id = (m as any).id;
        if (id === selectedTrackId) {
          map[companyName] = (map[companyName] || 0) + 1;
        }
      }
    }
    return Object.entries(map).map(([company, count]) => ({ company, count }));
  }, [logSheets, selectedTrackId]);

  const topSongs = useMemo(() => songCounts.sort((a: any, b: any) => b.count - a.count).slice(0, 10), [songCounts]);
  const topCompanies = useMemo(() => companyCounts.sort((a: any, b: any) => b.selectedMusic - a.selectedMusic).slice(0, 10), [companyCounts]);

  const globalTimeline = useMemo(() => {
    const map: Record<string, number> = {};
    for (const sheet of logSheets) {
      const date = new Date(sheet.createdDate).toLocaleDateString();
      map[date] = (map[date] || 0) + (sheet.selectedMusic?.length || 0);
    }
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
  }, [logSheets]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

  const isCurrentTrackVideo = currentTrack?.fileType?.toLowerCase().includes('video');

  return (
    <DashboardLayout title="Your Performance">
      {/* Media Players */}
      {isCurrentTrackVideo ? (
        <VideoPlayerDialog 
          open={playerOpen} 
          onOpenChange={setPlayerOpen} 
          track={currentTrack ? {
            id: currentTrack.id,
            title: currentTrack.title,
            artist: currentTrack.artist,
            fileUrl: currentTrack.fileUrl,
            fileType: currentTrack.fileType
          } : null} 
        />
      ) : (
        <MusicPlayerDialog 
          open={playerOpen} 
          onOpenChange={setPlayerOpen} 
          track={currentTrack ? {
            id: currentTrack.id,
            title: currentTrack.title,
            artist: currentTrack.artist,
            fileUrl: currentTrack.fileUrl,
            fileType: currentTrack.fileType,
            duration: currentTrack.duration
          } : null} 
        />
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Performance (Artist)</h1>
            <p className="text-muted-foreground">Track your music selections across all companies using log sheets</p>
          </div>
          <div className="w-72">
            <Input
              placeholder="Search your tracks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Quick Track Lookup */}
        <Card>
          <CardHeader>
            <CardTitle>Your Track Lookup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-sm text-muted-foreground">Search your songs by title to see how many companies have selected them.</div>
            <div className="grid grid-cols-1 gap-4">
              <div className="overflow-auto max-h-48">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="px-2 py-1">Title</th>
                      <th className="px-2 py-1">Selections</th>
                      <th className="px-2 py-1">Companies</th>
                    </tr>
                  </thead>
                  <tbody>
                    {songCounts
                      .filter((s: any) => !search.trim() || s.title.toLowerCase().includes(search.toLowerCase()))
                      .sort((a: any, b: any) => b.count - a.count)
                      .map((s: any) => (
                        <tr key={s.id} className="border-t">
                          <td className="px-2 py-1">
                            <div className="flex items-center gap-2">
                              {s.track?.fileType?.toLowerCase().includes('video') ? <Video className="h-4 w-4" /> : <FileMusic className="h-4 w-4" />}
                              <span>{s.title}</span>
                              {s.track?.fileUrl && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentTrack(s.track);
                                    setPlayerOpen(true);
                                  }}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-1 font-semibold">{s.count}</td>
                          <td className="px-2 py-1 min-w-[200px] max-w-[200px]">
                            <div className="overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
                              {Object.keys(s.companies || {}).length > 0 
                                ? Object.keys(s.companies).map((company, i) => (
                                  <React.Fragment key={company}>
                                    {i > 0 && <span className="mx-1">•</span>}
                                    <span className="text-sm">{company}</span>
                                  </React.Fragment>
                                ))
                                : '-'
                              }
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Songs: table + histogram + company breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Your Top Songs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 bg-muted rounded animate-pulse" />
            ) : songCounts.length === 0 ? (
              <p className="text-muted-foreground">No selections found. Share your music with companies so they can select it in their log sheets!</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <h4 className="text-lg font-semibold mb-2">All Your Songs</h4>
                  <div className="overflow-auto max-h-64">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left">
                          <th className="px-2 py-1">Title</th>
                          <th className="px-2 py-1">Selections</th>
                        </tr>
                      </thead>
                      <tbody>
                        {songCounts
                          .filter((s: any) => !search.trim() || s.title.toLowerCase().includes(search.toLowerCase()))
                          .sort((a: any, b: any) => b.count - a.count)
                          .map((s: any) => (
                            <tr key={s.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedTrackId(s.id)}>
                              <td className="px-2 py-1">
                                <div className="flex items-center gap-2">
                                  {s.track?.fileType?.toLowerCase().includes('video') ? <Video className="h-4 w-4" /> : <FileMusic className="h-4 w-4" />}
                                  <span>{s.title}</span>
                                  {s.track?.fileUrl && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentTrack(s.track);
                                        setPlayerOpen(true);
                                      }}
                                    >
                                      <Play className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                              <td className="px-2 py-1 font-semibold">{s.count}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <h4 className="text-lg font-semibold mb-2">Selections Distribution (Histogram)</h4>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={(() => {
                          const values = songCounts.map((s: any) => s.count);
                          if (values.length === 0) return [];
                          const max = Math.max(...values, 1);
                          const min = Math.min(...values, 0);
                          const binCount = Math.min(12, Math.max(6, Math.ceil(values.length / 5)));
                          const binSize = (max - min) / binCount;
                          const bins = new Array(binCount).fill(0);
                          values.forEach(v => {
                            const idx = Math.min(Math.floor((v - min) / (binSize || 1)), binCount - 1);
                            bins[idx]++;
                          });
                          return bins.map((count, i) => ({ range: `${Math.round(min + i * binSize)}-${Math.round(min + (i + 1) * binSize)}`, count }));
                        })()}
                        margin={{ top: 10, right: 20, left: 40, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" angle={-45} textAnchor="end" height={60} />
                        <YAxis label={{ value: 'Number of Songs', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#82ca9d">
                          {new Array(12).fill(0).map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {selectedTrackId && (
                    <div className="mt-4">
                      <h5 className="font-semibold">Companies that selected this song</h5>
                      <div className="overflow-auto max-h-40 mt-2">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left"><th className="px-2 py-1">Company</th><th className="px-2 py-1">Count</th></tr>
                          </thead>
                          <tbody>
                            {selectedCompanyData.map((c: any) => (
                              <tr key={c.company} className="border-t"><td className="px-2 py-1">{c.company}</td><td className="px-2 py-1 font-semibold">{c.count}</td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>All Your Songs</CardTitle>
            </CardHeader>
            <CardContent>
              {artistCounts.length === 0 ? (
                <p className="text-muted-foreground">No song activity</p>
              ) : (
                <div>
                  <div className="overflow-auto max-h-64">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left"><th className="px-2 py-1">Song</th><th className="px-2 py-1">Selections</th></tr>
                      </thead>
                      <tbody>
                        {artistCounts
                          .filter((a: any) => !search.trim() || a.name.toLowerCase().includes(search.toLowerCase()))
                          .sort((a: any, b: any) => b.count - a.count)
                          .map((a: any) => (
                            <tr key={a.name} className="border-t"><td className="px-2 py-1">{a.name}</td><td className="px-2 py-1 font-semibold">{a.count}</td></tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4" style={{ width: '100%', height: 180 }}>
                    <ResponsiveContainer>
                      <BarChart data={artistCounts.map((a: any) => ({ name: a.name, count: a.count }))} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={60} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8">
                          {artistCounts.map((_: any, i: number) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Companies</CardTitle>
            </CardHeader>
            <CardContent>
              {companyCounts.length === 0 ? (
                <p className="text-muted-foreground">No company activity</p>
              ) : (
                <div>
                  <div className="overflow-auto max-h-64">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left"><th className="px-2 py-1">Company</th><th className="px-2 py-1">LogSheets</th><th className="px-2 py-1">Selected Songs</th></tr>
                      </thead>
                      <tbody>
                        {companyCounts
                          .filter((c: any) => !search.trim() || c.company.toLowerCase().includes(search.toLowerCase()))
                          .sort((a: any, b: any) => b.selectedMusic - a.selectedMusic)
                          .map((c: any) => (
                            <tr key={c.company} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedCompany(c.company)}>
                              <td className="px-2 py-1">{c.company}</td>
                              <td className="px-2 py-1 font-semibold">{c.sheets}</td>
                              <td className="px-2 py-1 font-semibold">{c.selectedMusic}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4" style={{ width: '100%', height: 180 }}>
                    <ResponsiveContainer>
                      <BarChart data={companyCounts.map((c: any) => ({ name: c.company, count: c.selectedMusic }))} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={60} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ffc658">
                          {companyCounts.map((_: any, i: number) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company detail panel */}
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedCompany ? (
                <div className="text-sm text-muted-foreground">Click a company to view their selections of your music</div>
              ) : (
                <div>
                  <h4 className="font-semibold">{selectedCompany}</h4>
                  <div className="text-sm text-muted-foreground mb-2">Summary</div>
                  <div className="grid grid-cols-1 gap-2">
                    <div>Total LogSheets: <span className="font-semibold">{companyCounts.find((c: any) => c.company === selectedCompany)?.sheets || 0}</span></div>
                    <div>Total Songs Selected: <span className="font-semibold">{companySelectedCountMap[selectedCompany] || 0}</span></div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-semibold">Per-Song Counts</h5>
                    <div className="overflow-auto max-h-40 mt-2">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left"><th className="px-2 py-1">Song</th><th className="px-2 py-1">Count</th></tr>
                        </thead>
                        <tbody>
                          {Object.entries(songCounts
                            .reduce((acc: Record<string, any>, s: any) => {
                              acc[s.title] = { title: s.title, count: (s.companies?.[selectedCompany] || 0) };
                              return acc;
                            }, {})
                          ).map(([k, v]: any) => v)
                            .filter((r: any) => r.count > 0)
                            .sort((a: any, b: any) => b.count - a.count)
                            .map((r: any) => (
                              <tr key={r.title} className="border-t">
                                <td className="px-2 py-1">{r.title}</td>
                                <td className="px-2 py-1 font-semibold">{r.count}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-semibold">LogSheets</h5>
                    <div className="overflow-auto max-h-48 mt-2">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left"><th className="px-2 py-1">Date</th><th className="px-2 py-1">Selected Songs</th></tr>
                        </thead>
                        <tbody>
                          {(companySheetsMap[selectedCompany] || []).map((s: any) => (
                            <tr key={s.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => { setSelectedLogSheet(s); setLogSheetDialogOpen(true); }}>
                              <td className="px-2 py-1">{new Date(s.createdDate).toLocaleDateString()}</td>
                              <td className="px-2 py-1">{(s.selectedMusic || []).map((m: any) => m.title).join(', ')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* LogSheet Details Dialog */}
                  <Dialog open={logSheetDialogOpen} onOpenChange={setLogSheetDialogOpen}>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>LogSheet Details</DialogTitle>
                      </DialogHeader>
                      {selectedLogSheet ? (
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Company</div>
                            <div className="font-semibold">{selectedLogSheet.company?.companyName || 'Unknown Company'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Date</div>
                            <div className="font-semibold">{new Date(selectedLogSheet.createdDate).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Selected Tracks</div>
                            <div className="space-y-2">
                              {(selectedLogSheet.selectedMusic || []).length === 0 ? (
                                <div className="text-muted-foreground">No tracks selected.</div>
                              ) : (
                                (selectedLogSheet.selectedMusic || []).map((track: any) => (
                                  <div key={track.id} className="flex items-center gap-2 p-2 rounded border">
                                    {track.fileType?.toLowerCase().includes('video') ? <Video className="h-4 w-4" /> : <FileMusic className="h-4 w-4" />}
                                    <span className="font-semibold">{track.title}</span>
                                    <span className="text-xs text-muted-foreground">{track.artist || 'Unknown Artist'}</span>
                                    {track.fileUrl && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 w-6 p-0"
                                        onClick={() => {
                                          setCurrentTrack(track);
                                          setPlayerOpen(true);
                                        }}
                                      >
                                        <Play className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">LogSheet undefined.</div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Your Selections Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <LineChart data={globalTimeline} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#00C49F" strokeWidth={2} name="Selections" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ArtistPerformance;
