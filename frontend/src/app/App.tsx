import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { LayoutDashboard, Users, School, BookOpen, Wallet, Smartphone, FileText, UserCircle, CalendarDays, Megaphone } from 'lucide-react';
import { api } from '../services/api';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import ClassManagement from './components/ClassManagement';
import Academics from './components/Academics';
import Finance from './components/Finance';
import DeviceVerification from './components/DeviceVerification';
import AuditLogs from './components/AuditLogs';
import Profile from './components/Profile';
import PendingApproval from './components/PendingApproval';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingInfo, setPendingInfo] = useState<{ name: string; email: string; role?: string } | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (!['ADMIN', 'TEACHER', 'STUDENT'].includes(user.role)) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          return;
        }
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setCurrentPage('dashboard');
      toast.error('Your session expired. Please sign in again.');
    };

    window.addEventListener('auth:expired', handleExpiredSession);
    return () => window.removeEventListener('auth:expired', handleExpiredSession);
  }, []);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await api.login(credentials.email, credentials.password);

      if (!response.token || !response.user) {
        throw new Error('Invalid response from server');
      }

      if (!['ADMIN', 'TEACHER', 'STUDENT'].includes(response.user.role)) {
        throw new Error('This Version 2 portal is only for admin, teacher, and student accounts.');
      }

      // Store token and user data
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userData', JSON.stringify(response.user));

      setCurrentUser(response.user);
      setIsAuthenticated(true);
      setCurrentPage('dashboard');

      toast.success(`Welcome, ${response.user.name}!`);
    } catch (error: any) {
      // Handle pending approval — show waiting screen instead of toast
      if (error?.code === 'PENDING_APPROVAL' || error?.data?.code === 'PENDING_APPROVAL') {
        setPendingInfo({ name: credentials.email, email: credentials.email });
        return;
      }
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPendingInfo(null);
    setCurrentPage('dashboard');
    toast.success('Logged out successfully');
  };

  const getMenuItems = (role: User['role']) => {
    const adminItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'classes', label: 'Classes', icon: School },
      { id: 'academics', label: 'Academics', icon: BookOpen },
      { id: 'finance', label: 'Finance', icon: Wallet },
      { id: 'devices', label: 'Devices', icon: Smartphone },
      { id: 'audit', label: 'Audit Logs', icon: FileText },
      { id: 'profile', label: 'My Profile', icon: UserCircle },
    ];

    const teacherItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'classes', label: 'Classes', icon: School },
      { id: 'academics', label: 'Academics', icon: BookOpen },
      { id: 'profile', label: 'My Profile', icon: UserCircle },
    ];
    const studentItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'academics', label: 'Results', icon: BookOpen },
      { id: 'attendance', label: 'Attendance', icon: CalendarDays },
      { id: 'announcements', label: 'Announcements', icon: Megaphone },
      { id: 'profile', label: 'My Profile', icon: UserCircle },
    ];

    if (role === 'ADMIN') return adminItems;
    if (role === 'TEACHER') return teacherItems;
    if (role === 'STUDENT') return studentItems;
    return [];
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard role={currentUser?.role} userId={currentUser?.id} />;
      case 'users':
        return <UserManagement />;
      case 'classes':
        return <ClassManagement />;
      case 'academics':
        return <Academics />;
      case 'finance':
        if (currentUser?.role !== 'ADMIN') return <Unauthorized />;
        return <Finance />;
      case 'devices':
        if (currentUser?.role !== 'ADMIN') return <Unauthorized />;
        return <DeviceVerification />;
      case 'audit':
        if (currentUser?.role !== 'ADMIN') return <Unauthorized />;
        return <AuditLogs />;
      case 'profile':
        return <Profile user={currentUser} onProfileUpdate={(updated) => setCurrentUser(prev => prev ? { ...prev, ...updated } : prev)} />;
      case 'attendance':
      case 'announcements':
        return <Dashboard role={currentUser?.role} userId={currentUser?.id} />;
      default:
        return <NotFound onBack={() => setCurrentPage('dashboard')} />;
    }
  };

  // Show pending approval screen
  if (pendingInfo) {
    return (
      <>
        <PendingApproval info={pendingInfo} onBack={() => setPendingInfo(null)} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <>
        <Login onLogin={handleLogin} isLoading={isLoading} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  return (
    <>
      <Layout
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        menuItems={getMenuItems(currentUser.role)}
        userName={currentUser.name}
        userRole={currentUser.role}
      >
        {renderContent()}
      </Layout>
      <Toaster position="top-right" richColors />
    </>
  );
}

function Unauthorized() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md text-center bg-card border border-border rounded-xl p-8">
        <h1 className="text-card-foreground mb-3">Unauthorized</h1>
        <p className="text-muted-foreground">Your account does not have access to this workspace.</p>
      </div>
    </div>
  );
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md text-center bg-card border border-border rounded-xl p-8">
        <h1 className="text-card-foreground mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-6">The page you requested is not available in this portal.</p>
        <button onClick={onBack} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">
          Back to dashboard
        </button>
      </div>
    </div>
  );
}
