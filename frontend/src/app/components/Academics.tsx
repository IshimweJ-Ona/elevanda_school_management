import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardCheck, Award, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: number;
  name: string;
  present: boolean;
}

interface Exam {
  id: number;
  name: string;
  class: string;
  date: string;
  totalMarks: number;
}

const students: Student[] = [
  { id: 1, name: 'Mike Johnson', present: true },
  { id: 2, name: 'Tom Brown', present: true },
  { id: 3, name: 'Emily Davis', present: false },
  { id: 4, name: 'Chris Wilson', present: true },
  { id: 5, name: 'Lisa Anderson', present: true },
];

const initialExams: Exam[] = [
  { id: 1, name: 'Mid-term Math', class: 'Mathematics 101', date: '2026-05-15', totalMarks: 100 },
  { id: 2, name: 'Final English', class: 'English Literature', date: '2026-06-20', totalMarks: 100 },
];

export default function Academics() {
  const [viewMode, setViewMode] = useState<'teacher' | 'admin'>('teacher');
  const [attendance, setAttendance] = useState(students);
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [grade, setGrade] = useState('');

  const [examFormData, setExamFormData] = useState({
    name: '',
    class: 'Mathematics 101',
    date: '',
    totalMarks: 100,
  });

  const toggleAttendance = (id: number) => {
    setAttendance(attendance.map(s =>
      s.id === id ? { ...s, present: !s.present } : s
    ));
  };

  const handleSaveAttendance = () => {
    toast.success('Attendance saved successfully');
  };

  const handleSaveGrade = () => {
    if (selectedStudent && grade) {
      toast.success(`Grade ${grade} saved for student`);
      setSelectedStudent(null);
      setGrade('');
    }
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    const newExam: Exam = {
      id: Math.max(...exams.map(e => e.id)) + 1,
      ...examFormData,
    };
    setExams([...exams, newExam]);
    toast.success('Exam created successfully');
    setIsExamModalOpen(false);
    setExamFormData({ name: '', class: 'Mathematics 101', date: '', totalMarks: 100 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-card-foreground mb-2">Academics</h1>
          <p className="text-muted-foreground">Manage attendance, grades, and exams</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode('teacher')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'teacher'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border hover:bg-muted'
            }`}
          >
            Teacher View
          </button>
          <button
            onClick={() => setViewMode('admin')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'admin'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border hover:bg-muted'
            }`}
          >
            Admin View
          </button>
        </div>
      </div>

      {viewMode === 'teacher' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-card-foreground">Mark Attendance</h2>
            </div>

            <div className="space-y-3 mb-6">
              {attendance.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="text-card-foreground">{student.name}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={student.present}
                      onChange={() => toggleAttendance(student.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted-foreground/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                  </label>
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveAttendance}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Save Attendance
            </button>
          </motion.div>

          {/* Grades Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-success" />
              </div>
              <h2 className="text-card-foreground">Enter Grades</h2>
            </div>

            <div className="space-y-3 mb-6">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg"
                >
                  <span className="flex-1 text-card-foreground">{student.name}</span>
                  <input
                    type="text"
                    placeholder="Grade"
                    className="w-24 px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center"
                    value={selectedStudent === student.id ? grade : ''}
                    onChange={(e) => {
                      setSelectedStudent(student.id);
                      setGrade(e.target.value);
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveGrade}
              className="w-full bg-success text-success-foreground py-3 rounded-lg hover:bg-success/90 transition-colors"
            >
              Save Grades
            </button>
          </motion.div>
        </div>
      ) : (
        /* Admin View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-card-foreground">Exam Management</h2>
            <button
              onClick={() => setIsExamModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Exam
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left text-card-foreground">Exam Name</th>
                  <th className="px-6 py-4 text-left text-card-foreground">Class</th>
                  <th className="px-6 py-4 text-left text-card-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-card-foreground">Total Marks</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam, index) => (
                  <motion.tr
                    key={exam.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-card-foreground">{exam.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{exam.class}</td>
                    <td className="px-6 py-4 text-muted-foreground">{exam.date}</td>
                    <td className="px-6 py-4 text-muted-foreground">{exam.totalMarks}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Create Exam Modal */}
      <AnimatePresence>
        {isExamModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsExamModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-card-foreground">Create New Exam</h2>
                <button onClick={() => setIsExamModalOpen(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateExam} className="space-y-4">
                <div>
                  <label className="block text-card-foreground mb-2">Exam Name</label>
                  <input
                    type="text"
                    value={examFormData.name}
                    onChange={(e) => setExamFormData({ ...examFormData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="e.g., Mid-term Math"
                    required
                  />
                </div>

                <div>
                  <label className="block text-card-foreground mb-2">Assign to Class</label>
                  <select
                    value={examFormData.class}
                    onChange={(e) => setExamFormData({ ...examFormData, class: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option>Mathematics 101</option>
                    <option>English Literature</option>
                    <option>Physics Advanced</option>
                    <option>Chemistry Basics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-card-foreground mb-2">Exam Date</label>
                  <input
                    type="date"
                    value={examFormData.date}
                    onChange={(e) => setExamFormData({ ...examFormData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-card-foreground mb-2">Total Marks</label>
                  <input
                    type="number"
                    value={examFormData.totalMarks}
                    onChange={(e) => setExamFormData({ ...examFormData, totalMarks: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsExamModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
