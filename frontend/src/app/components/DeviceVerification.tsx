import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, CheckCircle, XCircle, AlertCircle, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface Device {
  id: string;
  userId: string;
  user?: { id: string; name: string; email: string; phone_number?: string; role?: string };
  isVerified: boolean;
  verifiedAt?: string;
}

export default function DeviceVerification() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmDeny, setConfirmDeny] = useState<Device | null>(null);

  useEffect(() => {
    loadPendingDevices();
  }, []);

  const loadPendingDevices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getPendingDevices();
      setDevices(Array.isArray(response) ? response : response.devices || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load devices';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (deviceId: string) => {
    setProcessingId(deviceId);
    try {
      await api.verifyDevice(deviceId);
      setDevices(prev => prev.filter(d => d.id !== deviceId));
      toast.success('Device approved — user has been notified by email.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve device');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async (device: Device) => {
    setProcessingId(device.id);
    try {
      await api.denyDevice(device.id);
      setDevices(prev => prev.filter(d => d.id !== device.id));
      toast.success('Registration denied — user has been notified by email.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to deny device');
    } finally {
      setProcessingId(null);
      setConfirmDeny(null);
    }
  };

  const pendingDevices = devices.filter(d => !d.isVerified);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-card-foreground mb-2">Device Verification</h1>
        <p className="text-muted-foreground">Review and approve or deny account access requests</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">{error}</p>
            <button onClick={loadPendingDevices} className="text-xs text-destructive hover:underline mt-2">
              Retry
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <h3 className="text-card-foreground text-2xl font-bold">{pendingDevices.length}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Loaded</p>
              <h3 className="text-card-foreground text-2xl font-bold">{devices.length}</h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pending Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-card-foreground">Pending Access Requests</h2>
          <button
            onClick={loadPendingDevices}
            disabled={isLoading}
            className="text-sm text-primary hover:underline disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="px-6 py-12 text-center text-muted-foreground">Loading requests...</div>
        ) : pendingDevices.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3 opacity-60" />
            <p className="text-muted-foreground">No pending access requests</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pendingDevices.map((device, index) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="px-6 py-5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">
                        {device.user?.name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-muted-foreground">{device.user?.email || device.userId}</p>
                      {device.user?.phone_number && (
                        <p className="text-sm text-muted-foreground">{device.user.phone_number}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          device.user?.role === 'TEACHER' ? 'bg-success/10 text-success' :
                          device.user?.role === 'STUDENT' ? 'bg-warning/10 text-warning' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {device.user?.role || 'Unknown Role'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-warning/10 text-warning">
                          Pending Approval
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(device.id)}
                      disabled={processingId === device.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {processingId === device.id ? 'Processing…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => setConfirmDeny(device)}
                      disabled={processingId === device.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-destructive/10 text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/20 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
                    >
                      <XCircle className="w-4 h-4" />
                      Deny
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Deny Confirmation Modal */}
      <AnimatePresence>
        {confirmDeny && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDeny(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <h2 className="text-card-foreground text-lg font-semibold">Deny Access Request</h2>
              </div>

              <p className="text-muted-foreground mb-2">
                You are about to <strong className="text-destructive">deny</strong> the access request for:
              </p>
              <div className="bg-muted rounded-lg p-3 mb-6">
                <p className="font-medium text-card-foreground">{confirmDeny.user?.name}</p>
                <p className="text-sm text-muted-foreground">{confirmDeny.user?.email}</p>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                The user will receive an email notification informing them that their registration has been denied, with instructions to contact support.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeny(null)}
                  className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeny(confirmDeny)}
                  disabled={processingId === confirmDeny.id}
                  className="flex-1 px-4 py-3 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {processingId === confirmDeny.id ? 'Denying…' : 'Yes, Deny Access'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
