import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Phone, Mail, Save, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { authStorage } from '../../services/authStorage';

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ProfileProps {
  user: ProfileUser | null;
  onProfileUpdate: (updated: Partial<ProfileUser>) => void;
}

export default function Profile({ user, onProfileUpdate }: ProfileProps) {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone_number: '',
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.getProfile();
      const u = res.user;
      setProfileData({
        name: u.name || '',
        email: u.email || '',
        phone_number: u.phone_number || '',
      });
    } catch (err) {
      // Fall back to prop data
      if (user) {
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone_number: '',
        });
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess(false);
    try {
      const res = await api.updateProfile({
        name: profileData.name,
        email: profileData.email,
        phone_number: profileData.phone_number || undefined,
      });

      const stored = authStorage.getUserData();
      if (stored) {
        const parsed = JSON.parse(stored);
        authStorage.updateUserData({ ...parsed, ...res.user });
      }

      onProfileUpdate({ name: res.user.name, email: res.user.email });
      setProfileSuccess(true);
      toast.success('Profile updated successfully');
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSavingPassword(true);
    setPasswordSuccess(false);
    try {
      await api.updateProfile({ password: passwordData.password });
      setPasswordData({ password: '', confirmPassword: '' });
      setPasswordSuccess(true);
      toast.success('Password changed successfully');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-primary/10 text-primary',
    TEACHER: 'bg-success/10 text-success',
    STUDENT: 'bg-warning/10 text-warning',
    PARENT: 'bg-info/10 text-info',
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-card-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">Update your personal information and password</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border overflow-hidden"
      >
        {/* Avatar Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/70 px-6 py-8 flex items-center gap-5">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-white text-xl font-semibold">{profileData.name || user?.name}</h2>
            <p className="text-white/70 text-sm">{profileData.email || user?.email}</p>
            <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Profile Info Form */}
        <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
          <h3 className="text-card-foreground font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Personal Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Your full name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={profileData.phone_number}
                onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="+250 780 000 000"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 font-medium"
          >
            {profileSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isSavingProfile ? 'Saving…' : 'Save Changes'}
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <h3 className="text-card-foreground font-semibold flex items-center gap-2 mb-5">
          <Lock className="w-4 h-4 text-primary" />
          Change Password
        </h3>

        <form onSubmit={handleSavePassword} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.password}
                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                className="w-full pl-11 pr-12 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Minimum 6 characters"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full pl-11 pr-12 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Re-enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordData.confirmPassword && passwordData.password !== passwordData.confirmPassword && (
              <p className="text-xs text-destructive mt-1">Passwords do not match</p>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
            <p className="text-xs text-amber-700">
              After changing your password, you will need to use the new password the next time you log in.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSavingPassword || (!!passwordData.confirmPassword && passwordData.password !== passwordData.confirmPassword)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 font-medium"
          >
            {passwordSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Password Changed!
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                {isSavingPassword ? 'Saving…' : 'Change Password'}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
