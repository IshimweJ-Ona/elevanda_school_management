import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface AuditLog {
  id: string;
  admin: string;
  action: string;
  entity: string;
  timestamp: string;
  type: 'Create' | 'Update' | 'Delete';
}

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const response = await api.getAuditLogs();
        const mapped: AuditLog[] = (response.logs || []).map((log: any) => ({
          id: log.id,
          admin: log.admin?.name || 'Unknown',
          action: log.action,
          entity: `${log.entity}:${log.entityId}`,
          timestamp: new Date(log.createdAt).toLocaleString(),
          type: log.action.includes('CREATE') ? 'Create' : log.action.includes('DELETE') ? 'Delete' : 'Update',
        }));
        setAuditLogs(mapped);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load audit logs');
      }
    };
    loadLogs();
  }, []);

  const handleExport = async () => {
    try {
      const raw = await api.exportData();
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `school-export-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Export failed');
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.admin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.entity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-card-foreground">Audit Logs</h1>
          <p className="text-muted-foreground">Track all administrative actions</p>
        </div>
        <button
          onClick={handleExport}
          className="ml-auto px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Export JSON
        </button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 border border-border"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs by admin, action, or entity..."
              className="w-full pl-12 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              <option value="All">All Actions</option>
              <option value="Create">Create</option>
              <option value="Update">Update</option>
              <option value="Delete">Delete</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-card-foreground">Admin</th>
                <th className="px-6 py-4 text-left text-card-foreground">Action</th>
                <th className="px-6 py-4 text-left text-card-foreground">Entity</th>
                <th className="px-6 py-4 text-left text-card-foreground">Type</th>
                <th className="px-6 py-4 text-left text-card-foreground">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log, index) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 text-card-foreground">{log.admin}</td>
                  <td className="px-6 py-4 text-card-foreground">{log.action}</td>
                  <td className="px-6 py-4 text-muted-foreground">{log.entity}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      log.type === 'Create' ? 'bg-success/10 text-success' :
                      log.type === 'Update' ? 'bg-primary/10 text-primary' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{log.timestamp}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
