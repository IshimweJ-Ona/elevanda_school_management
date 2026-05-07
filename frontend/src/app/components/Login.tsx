import { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, GraduationCap, Lock, Mail, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (credentials: { email: string; password: string; expectedRole?: 'ADMIN' | 'TEACHER' | 'STUDENT' }) => Promise<void>;
  isLoading?: boolean;
}

export default function Login({ onLogin, isLoading: externalLoading }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMode, setLoginMode] = useState<'admin' | 'school'>('admin');
  const [schoolRole, setSchoolRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [localLoading, setLocalLoading] = useState(false);
  const isLoading = externalLoading || localLoading;
  const expectedRole = loginMode === 'admin' ? 'ADMIN' : schoolRole;
  const title = loginMode === 'admin'
    ? 'Admin Login'
    : schoolRole === 'STUDENT'
      ? 'Student Login'
      : 'Teacher Login';
  const helperText = loginMode === 'admin'
    ? 'Sign in to manage users, classes, finance, and approvals.'
    : 'Sign in to your classroom workspace with your school credentials.';
  const Icon = loginMode === 'admin' ? ShieldCheck : schoolRole === 'STUDENT' ? GraduationCap : BookOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);

    try {
      await onLogin({ email, password, expectedRole });
    } catch (error) {
      // Errors are handled in App.tsx, but catch here to avoid unhandled rejection
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-card-foreground mb-2">{title}</h1>
            <p className="text-muted-foreground">{helperText}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {loginMode === 'school' && (
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                <button
                  type="button"
                  onClick={() => setSchoolRole('STUDENT')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    schoolRole === 'STUDENT'
                      ? 'bg-card text-card-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-card-foreground'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setSchoolRole('TEACHER')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    schoolRole === 'TEACHER'
                      ? 'bg-card text-card-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-card-foreground'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Teacher
                </button>
              </div>
            )}

            <div>
              <label className="block text-card-foreground mb-2">
                {loginMode === 'admin' ? 'Admin email or phone' : 'School email or phone'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder={loginMode === 'admin' ? 'admin@school.local' : 'name@school.local or +2507...'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-card-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary hover:underline">Forgot password?</button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : loginMode === 'admin' ? 'Login' : `Login as ${schoolRole.toLowerCase()}`}
            </button>

            <button
              type="button"
              onClick={() => setLoginMode((mode) => mode === 'admin' ? 'school' : 'admin')}
              className="w-full text-sm text-primary hover:underline"
            >
              {loginMode === 'admin' ? 'Student/teacher login' : 'Admin login'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Use your school credentials to access the portal.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
