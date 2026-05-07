import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Award, BookOpen, ClipboardCheck, GraduationCap } from 'lucide-react';
import { api } from '../../services/api';

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export default function Academics({ role }: { role?: string }) {
  if (role === 'ADMIN') return <AdminAcademics />;
  if (role === 'TEACHER') return <TeacherAcademics />;
  return <StudentResults />;
}

function StudentResults() {
  const [studentDashboard, setStudentDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getStudentDashboard()
      .then((response) => setStudentDashboard(response.student))
      .catch(() => setStudentDashboard(null))
      .finally(() => setIsLoading(false));
  }, []);

  const results = studentDashboard?.grades || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-card-foreground mb-2">My Results</h1>
        <p className="text-muted-foreground">View your recorded grades and exam results.</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="px-6 py-12 text-center text-muted-foreground">Loading results...</div>
        ) : results.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">No results recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left text-card-foreground">Exam</th>
                  <th className="px-6 py-4 text-left text-card-foreground">Subject</th>
                  <th className="px-6 py-4 text-left text-card-foreground">Score</th>
                  <th className="px-6 py-4 text-left text-card-foreground">Grade</th>
                  <th className="px-6 py-4 text-left text-card-foreground">Recorded</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result: any, index: number) => (
                  <motion.tr
                    key={result.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.04 }}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-6 py-4 text-card-foreground">{result.exam?.title || 'Result'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{result.exam?.subject || 'N/A'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{result.score}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm">
                        {result.grade || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'Recorded'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TeacherAcademics() {
  const [teacherDashboard, setTeacherDashboard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getTeacherDashboard()
      .then((response) => setTeacherDashboard(response.teacher))
      .catch(() => setTeacherDashboard(null))
      .finally(() => setIsLoading(false));
  }, []);

  const classes = teacherDashboard?.classes || [];
  const exams = teacherDashboard?.exams || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-card-foreground mb-2">Teacher Academics</h1>
        <p className="text-muted-foreground">Work with your assigned classes only.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Summary label="Assigned Classes" value={classes.length} icon={BookOpen} />
        <Summary label="Assigned Students" value={classes.reduce((sum: number, cls: any) => sum + (cls.studentCount || 0), 0)} icon={GraduationCap} />
        <Summary label="Exams Created" value={exams.length} icon={Award} />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center gap-3">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          <h2 className="text-card-foreground">Assigned Classes</h2>
        </div>
        {isLoading ? (
          <div className="px-6 py-12 text-center text-muted-foreground">Loading classes...</div>
        ) : classes.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">No classes assigned yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {classes.map((classItem: any) => (
              <div key={classItem.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-card-foreground">{classItem.name}</p>
                  <p className="text-sm text-muted-foreground">{classItem.studentCount || 0} students</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminAcademics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-card-foreground mb-2">Admin Academics</h1>
        <p className="text-muted-foreground">Academic oversight for school administrators.</p>
      </div>

      <div className="bg-card rounded-xl p-8 border border-border">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-card-foreground mb-2">No academic records to display</h2>
        <p className="text-muted-foreground">
          Teacher-entered exams and results will appear here once the admin reporting endpoint is connected.
        </p>
      </div>
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
