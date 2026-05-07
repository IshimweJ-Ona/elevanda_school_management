import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DollarSign, CreditCard, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface Invoice {
  id: string;
  studentId: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  dueDate: string;
  createdAt: string;
}

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  createdAt: string;
}

interface RefundRequest {
  id: string;
  studentId: string;
  amount: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const formatRwf = (value: number) => `RWF ${value.toLocaleString()}`;

export default function Finance() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [invoiceResponse, paymentResponse] = await Promise.all([
        api.getInvoices(),
        api.getPayments(),
      ]);

      setInvoices(invoiceResponse.invoices || []);
      setPayments(paymentResponse.payments || []);
      setRefundRequests([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load finance data';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayInvoice = async () => {
    if (!selectedInvoice || !paymentAmount) {
      toast.error('Please select an invoice and enter amount');
      return;
    }

    try {
      await api.payInvoice({
        invoiceId: selectedInvoice.id,
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
      });

      // Update invoice status
      setInvoices(invoices.map(inv =>
        inv.id === selectedInvoice.id
          ? { ...inv, status: 'PAID' as const }
          : inv
      ));

      toast.success('Payment processed successfully');
      setSelectedInvoice(null);
      setPaymentAmount('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      toast.error(message);
    }
  };

  const handleApproveRefund = (refundId: string) => {
    setRefundRequests(refundRequests.map(r =>
      r.id === refundId ? { ...r, status: 'APPROVED' as const } : r
    ));
    toast.success('Refund approved - email sent to student');
  };

  const handleRejectRefund = (refundId: string) => {
    setRefundRequests(refundRequests.map(r =>
      r.id === refundId ? { ...r, status: 'REJECTED' as const } : r
    ));
    toast.error('Refund rejected - notification sent');
  };

  const totalRevenue = invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices
    .filter(i => i.status !== 'PAID')
    .reduce((sum, i) => sum + i.amount, 0);
  const pendingRefunds = refundRequests.filter(r => r.status === 'PENDING');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-card-foreground mb-2">Finance Management</h1>
        <p className="text-muted-foreground">Track invoices, payments, and refund requests</p>
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
            <button
              onClick={loadFinanceData}
              className="text-xs text-destructive hover:underline mt-2"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <h3 className="text-card-foreground">{formatRwf(totalRevenue)}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Amount</p>
              <h3 className="text-card-foreground">{formatRwf(pendingAmount)}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Refunds</p>
              <h3 className="text-card-foreground">{pendingRefunds.length}</h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Invoices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-card-foreground">Invoices</h2>
        </div>
        {isLoading ? (
          <div className="px-6 py-12 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left text-card-foreground">Invoice ID</th>
                  <th className="px-6 py-4 text-left text-card-foreground">Amount</th>
                  <th className="px-6 py-4 text-left text-card-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-card-foreground">Due Date</th>
                  <th className="px-6 py-4 text-left text-card-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-card-foreground font-mono text-sm">{invoice.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-card-foreground">{formatRwf(invoice.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        invoice.status === 'PAID' ? 'bg-success/10 text-success' :
                        invoice.status === 'PENDING' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {invoice.status !== 'PAID' && (
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="px-3 py-1 text-sm bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                        >
                          Process
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Recent Payments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-card-foreground">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-card-foreground">Payment ID</th>
                <th className="px-6 py-4 text-left text-card-foreground">Amount</th>
                <th className="px-6 py-4 text-left text-card-foreground">Method</th>
                <th className="px-6 py-4 text-left text-card-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <motion.tr
                  key={payment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 text-card-foreground font-mono text-sm">{payment.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-success">{formatRwf(payment.amount)}</td>
                  <td className="px-6 py-4 text-muted-foreground">{payment.method}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Refund Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-card-foreground">Refund Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-card-foreground">Refund ID</th>
                <th className="px-6 py-4 text-left text-card-foreground">Amount</th>
                <th className="px-6 py-4 text-left text-card-foreground">Reason</th>
                <th className="px-6 py-4 text-left text-card-foreground">Status</th>
                <th className="px-6 py-4 text-left text-card-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {refundRequests.map((refund, index) => (
                <motion.tr
                  key={refund.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 text-card-foreground font-mono text-sm">{refund.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-card-foreground">{formatRwf(refund.amount)}</td>
                  <td className="px-6 py-4 text-muted-foreground">{refund.reason || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      refund.status === 'APPROVED' ? 'bg-success/10 text-success' :
                      refund.status === 'REJECTED' ? 'bg-destructive/10 text-destructive' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {refund.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {refund.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveRefund(refund.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRefund(refund.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payment Modal */}
      {selectedInvoice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedInvoice(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-card-foreground mb-4">Process Payment</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Invoice ID</label>
                <p className="text-card-foreground font-mono">{selectedInvoice.id}</p>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">Amount Due</label>
                <p className="text-2xl text-card-foreground font-bold">{formatRwf(selectedInvoice.amount)}</p>
              </div>

              <div>
                <label htmlFor="pay-amount" className="block text-sm text-muted-foreground mb-2">Payment Amount</label>
                <input
                  id="pay-amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="pay-method" className="block text-sm text-muted-foreground mb-2">Payment Method</label>
                <select
                  id="pay-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="CARD">Credit Card</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayInvoice}
                className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
              >
                Process Payment
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
