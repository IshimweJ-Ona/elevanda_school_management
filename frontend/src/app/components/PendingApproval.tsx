import { motion } from 'motion/react';
import { Clock, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

interface PendingApprovalProps {
  info: { name: string; email: string; role?: string };
  onBack: () => void;
}

export default function PendingApproval({ info, onBack }: PendingApprovalProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/90 to-primary/60 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-8 py-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Clock className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-white text-2xl font-bold mb-1">Registration Received!</h1>
            <p className="text-white/80 text-sm">Your request is being reviewed</p>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-gray-800 text-xl font-semibold mb-3">
                Thank you for registering into our system!
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Your account is currently awaiting approval from the administrator. Access to the system will be granted once your registration has been reviewed and approved.
              </p>

              {/* Timeline Steps */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Registration submitted</p>
                    <p className="text-sm text-gray-400">Your account details have been recorded</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Pending admin review</p>
                    <p className="text-sm text-gray-400">This may take up to <strong>48 hours</strong></p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-400">Email notification</p>
                    <p className="text-sm text-gray-400">
                      You will receive a confirmation email at <strong className="text-gray-600">{info.email}</strong> once your account is approved or declined
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-700">Check your email</p>
                    <p className="text-sm text-blue-600 mt-1">
                      A confirmation email has been sent to <strong>{info.email}</strong>. 
                      Please check your inbox (and spam folder) for further instructions.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Elevanda School Management System &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
