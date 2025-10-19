import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { downloadFile } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  accessor: keyof T | ((item: T) => any);
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  className?: string;
}

export interface Action<T> {
  label: string;
  icon?: React.ElementType;
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  disabled?: (item: T) => boolean;
  show?: (item: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  filterable?: boolean;
  exportable?: boolean;
  pagination?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  title?: string;
  description?: string;
  emptyMessage?: string;
  className?: string;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  filterable = false,
  exportable = false,
  pagination = true,
  showPagination = true,
  pageSize = 10,
  title,
  description,
  emptyMessage = 'No data available',
  className = '',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [playingItem, setPlayingItem] = useState<string | null>(null);

  // Filter and search data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter((item) =>
      columns.some((column) => {
        const value = typeof column.accessor === 'function' 
          ? column.accessor(item)
          : item[column.accessor as keyof T];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handlePlay = async (item: any) => {
    if (playingItem === item.id) {
      setPlayingItem(null);
      // Stop audio
    } else {
      setPlayingItem(item.id);
      // Play audio
      if (item.fileUrl) {
        const audio = new Audio(item.fileUrl);
        audio.play().catch(console.error);
      }
    }
  };

  const handleDownload = async (item: any) => {
    if (item.fileUrl && item.title) {
      try {
        const link = document.createElement('a');
        link.href = item.fileUrl;
        link.download = `${item.title}.${item.fileType || 'mp3'}`;
        link.click();
        link.href = item.fileUrl;
        link.download = `${item.title}.${item.fileType || 'mp3'}`;
        link.click();
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      APPROVED: { variant: 'default' as const, className: 'bg-namsa-success text-white' },
      PENDING: { variant: 'secondary' as const, className: 'bg-namsa-warning text-white' },
      REJECTED: { variant: 'destructive' as const, className: 'bg-namsa-error text-white' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <Badge variant={config.variant} className={`${config.className} hover-scale`}>
        {status === 'APPROVED' && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
        {status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
        {status}
      </Badge>
    );
  };

  const renderCellValue = (column: Column<T>, item: T) => {
    const value = typeof column.accessor === 'function' 
      ? column.accessor(item)
      : item[column.accessor as keyof T];

    if (column.render) {
      return column.render(value, item);
    }

    // Special handling for common field types
    if (column.key === 'status' && typeof value === 'object') {
      const statusName = (value?.statusName || value?.status || '').toString().toUpperCase();
      if (statusName) return getStatusBadge(statusName);
    }

    if (column.key === 'uploadedDate' || column.key === 'createdAt' || column.key === 'dateRecorded') {
      return value ? new Date(value).toLocaleDateString() : '-';
    }

    if (column.key === 'fileUrl' && value) {
      return (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePlay(item)}
            className="hover-scale"
          >
            {playingItem === item.id ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(item)}
            className="hover-scale"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return value || '-';
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} animate-fade-in`}>
      <CardContent className="p-0">
        {/* Header */}
        {(title || searchable || filterable || exportable) && (
          <div className="p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                {title && <h3 className="text-lg font-semibold">{title}</h3>}
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
              </div>
              
              <div className="flex items-center space-x-2">
                {searchable && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-[200px] transition-all duration-200 focus:w-[250px]"
                    />
                  </div>
                )}
                
                {filterable && (
                  <Button variant="outline" size="sm" className="hover-scale">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                )}
                
                {exportable && (
                  <Button variant="outline" size="sm" className="hover-scale">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="data-table">
            <TableHeader>
              <TableRow>
                {columns.map((column, i) => (
                  <TableHead
                    key={i}
                    className={`${column.width || ''} ${column.className || ''} ${
                      column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key as string)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {column.sortable && sortConfig?.key === column.key && (
                        <span className="text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
                {actions.length > 0 && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow 
                    key={index} 
                    className="transition-colors duration-200 hover:bg-muted/30"
                  >
                    {columns.map((column, i) => (
                      <TableCell key={i} className={column.className}>
                        {renderCellValue(column, item)}
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover-scale"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="animate-scale-in">
                            {actions.map((action, actionIndex) => {
                              const shouldShow = action.show ? action.show(item) : true;
                              const isDisabled = action.disabled ? action.disabled(item) : false;
                              
                              if (!shouldShow) return null;
                              
                              return (
                                <React.Fragment key={actionIndex}>
                                  <DropdownMenuItem
                                    onClick={() => !isDisabled && action.onClick(item)}
                                    disabled={isDisabled}
                                    className={`cursor-pointer ${
                                      action.variant === 'destructive'
                                        ? 'text-destructive focus:text-destructive'
                                        : action.variant === 'success'
                                        ? 'text-namsa-success focus:text-namsa-success'
                                        : action.variant === 'warning'
                                        ? 'text-namsa-warning focus:text-namsa-warning'
                                        : ''
                                    }`}
                                  >
                                    {action.icon && (
                                      <action.icon className="mr-2 h-4 w-4" />
                                    )}
                                    {action.label}
                                  </DropdownMenuItem>
                                  {actionIndex < actions.length - 1 && (
                                    <DropdownMenuSeparator />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                    className="text-center py-12 text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {showPagination && pagination && totalPages > 1 && (
          <div className="p-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} to{' '}
                {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="hover-scale"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = currentPage - 2 + i;
                    if (page < 1 || page > totalPages) return null;
                    
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 p-0 hover-scale ${
                          page === currentPage ? 'bg-gradient-namsa' : ''
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="hover-scale"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DataTable;
