import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Users, GraduationCap, DollarSign, TrendingUp, BookOpen, CalendarDays, Megaphone, Wallet } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';

interface DashboardProps {
  role?: string;
  userId?: string;
}

const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
];

const studentGrowthData = [
  { month: 'Jan', students: 1200 },
  { month: 'Feb', students: 1250 },
  { month: 'Mar', students: 1300 },
  { month: 'Apr', students: 1380 },
  { month: 'May', students: 1450 },
  { month: 'Jun', students: 1520 },
];

const attendanceData = [
  { name: 'Present', value: 85, color: '#22C55E' },
  { name: 'Absent', value: 10, color: '#EF4444' },
  { name: 'Late', value: 5, color: '#F59E0B' },
];

const formatAmount = (value: number) => `RWF ${value.toLocaleString()}`;

export default function Dashboard({ role }: DashboardProps) {
  const [adminStats, setAdminStats] = useState<any>(null);
  const [teacherDashboard, setTeacherDashboard] = useState<any>(null);
  const [studentDashboard, setStudentDashboard] = useState<any>(null);

  useEffect(() => {
    if (role === 'ADMIN') {
      api.getDashboardStats().then((response) => setAdminStats(response.stats)).catch(() => null);
    }
    if (role === 'TEACHER') {
      api.getTeacherDashboard().then((response) => setTeacherDashboard(response.teacher)).catch(() => null);
    }
    if (role === 'STUDENT') {
      api.getStudentDashboard().then((response) => setStudentDashboard(response.student)).catch(() => null);
    }
  }, [role]);

  if (role === 'STUDENT') {
    const student = studentDashboard;
    const studentStats = [
      { label: 'Class', value: student?.class || 'Unassigned', icon: Users, color: 'bg-primary' },
      { label: 'Assignments', value: String(student?.assignments?.length || 0), icon: BookOpen, color: 'bg-[#22C55E]' },
      { label: 'Attendance Records', value: String(student?.attendance?.length || 0), icon: CalendarDays, color: 'bg-[#F59E0B]' },
      { label: 'Fee Balance', value: formatAmount(student?.balance || 0), icon: Wallet, color: 'bg-[#8B5CF6]' },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-card-foreground mb-2">Student Dashboard</h1>
          <p className="text-muted-foreground">Your classes, results, attendance, announcements, timetable, and fees.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentStats.map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="bg-card rounded-xl p-6 border border-border">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-card-foreground mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Recent Results" empty={!student?.grades?.length}>
            {student?.grades?.map((result: any) => (
              <Row key={result.id} label={result.grade || `${result.score}%`} value={result.remarks || 'Recorded result'} />
            ))}
          </Panel>
          <Panel title="Announcements" empty={!student?.announcements?.length} icon={Megaphone}>
            {student?.announcements?.map((announcement: any) => (
              <Row key={announcement.id} label={announcement.title} value={new Date(announcement.createdAt).toLocaleDateString()} />
            ))}
          </Panel>
        </div>
      </div>
    );
  }

  if (role === 'TEACHER') {
    const classes = teacherDashboard?.classes || [];
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-card-foreground mb-2">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Your assigned classes, students, exams, attendance, and academic work.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Summary label="Assigned Classes" value={classes.length} icon={Users} />
          <Summary label="Assigned Students" value={classes.reduce((sum: number, cls: any) => sum + (cls.studentCount || 0), 0)} icon={GraduationCap} />
          <Summary label="Exams Created" value={teacherDashboard?.exams?.length || 0} icon={BookOpen} />
        </div>
        <Panel title="Classes" empty={!classes.length}>
          {classes.map((cls: any) => (
            <Row key={cls.id} label={cls.name} value={`${cls.studentCount} students`} />
          ))}
        </Panel>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Students',
      value: String(adminStats?.totalStudents ?? '0'),
      change: '+12%',
      icon: Users,
      color: 'bg-primary',
      trend: 'up'
    },
    {
      label: 'Total Teachers',
      value: String(adminStats?.totalTeachers ?? '0'),
      change: '+5%',
      icon: GraduationCap,
      color: 'bg-[#22C55E]',
      trend: 'up'
    },
    {
      label: 'Revenue',
      value: formatAmount(adminStats?.revenue ?? 0),
      change: '+18%',
      icon: DollarSign,
      color: 'bg-[#F59E0B]',
      trend: 'up'
    },
    {
      label: 'Attendance',
      value: `${adminStats?.attendance ?? 0}%`,
      change: '+2%',
      icon: TrendingUp,
      color: 'bg-[#8B5CF6]',
      trend: 'up'
    },
  ];

  const welcomeMessage = 'Welcome back, Admin! Here is the latest activity.';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-card-foreground mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">{welcomeMessage}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-success">{stat.change}</span>
            </div>
            <h3 className="text-card-foreground mb-1">{stat.value}</h3>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <h3 className="text-card-foreground mb-6">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={adminStats?.revenueData || revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip
                formatter={(value) => formatAmount(Number(value))}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1D4ED8"
                strokeWidth={3}
                dot={{ fill: '#1D4ED8', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <h3 className="text-card-foreground mb-6">Student Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={adminStats?.studentGrowthData || studentGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="students" fill="#22C55E" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card rounded-xl p-6 border border-border"
      >
        <h3 className="text-card-foreground mb-6">Attendance Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={adminStats?.attendanceDistribution ? [
                { name: 'Present', value: adminStats.attendanceDistribution.present, color: '#22C55E' },
                { name: 'Absent', value: adminStats.attendanceDistribution.absent, color: '#EF4444' },
                { name: 'Late', value: adminStats.attendanceDistribution.late, color: '#F59E0B' },
              ] : attendanceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {(adminStats?.attendanceDistribution ? [
                { name: 'Present', value: adminStats.attendanceDistribution.present, color: '#22C55E' },
                { name: 'Absent', value: adminStats.attendanceDistribution.absent, color: '#EF4444' },
                { name: 'Late', value: adminStats.attendanceDistribution.late, color: '#F59E0B' },
              ] : attendanceData).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-card rounded-xl p-6 border border-border"
      >
        <h3 className="text-card-foreground mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'New student enrolled', time: '5 minutes ago', type: 'success' },
            { action: 'Payment received', time: '1 hour ago', type: 'info' },
            { action: 'Teacher submitted grades', time: '2 hours ago', type: 'success' },
            { action: 'Device verification pending', time: '3 hours ago', type: 'warning' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-success' :
                  activity.type === 'warning' ? 'bg-warning' :
                  'bg-primary'
                }`} />
                <p className="text-card-foreground">{activity.action}</p>
              </div>
              <p className="text-sm text-muted-foreground">{activity.time}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function Summary({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-card-foreground mb-1">{value}</h3>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Panel({ title, empty, children }: { title: string; empty: boolean; children: ReactNode; icon?: any }) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-card-foreground mb-4">{title}</h3>
      {empty ? <p className="text-muted-foreground">No records available yet.</p> : <div className="space-y-3">{children}</div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border last:border-0 py-3">
      <p className="text-card-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  );
}
