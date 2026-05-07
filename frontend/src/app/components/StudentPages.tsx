import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, Megaphone } from 'lucide-react';
import { api } from '../../services/api';

interface StudentPagesProps {
  view: 'attendance' | 'announcements';
}

export default function StudentPages({ view }: StudentPagesProps) {
  const [studentDashboard, setStudentDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getStudentDashboard()
      .then((response) => setStudentDashboard(response.student))
      .catch(() => setStudentDashboard(null))
      .finally(() => setIsLoading(false));
  }, []);

  const isAttendance = view === 'attendance';
  const records = isAttendance
    ? studentDashboard?.attendance || []
    : studentDashboard?.announcements || [];
  const Icon = isAttendance ? CalendarDays : Megaphone;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-card-foreground mb-2">
          {isAttendance ? 'My Attendance' : 'Announcements'}
        </h1>
        <p className="text-muted-foreground">
          {isAttendance ? 'View your recent attendance records.' : 'View announcements for your class.'}
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="px-6 py-12 text-center text-muted-foreground">Loading...</div>
        ) : records.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            No {isAttendance ? 'attendance records' : 'announcements'} available yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {records.map((record: any, index: number) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 px-6 py-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-card-foreground">
                    {isAttendance ? record.status : record.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isAttendance
                      ? record.date ? new Date(record.date).toLocaleDateString() : 'Recorded'
                      : record.body}
                  </p>
                </div>
                {!isAttendance && record.createdAt && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
