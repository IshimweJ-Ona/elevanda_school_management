import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Users, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface ClassRecord {
  id: string;
  name: string;
  level?: string;
  academicYear?: string;
  teacher?: {
    id: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  students?: unknown[];
  studentCount?: number;
}

interface TeacherUser {
  id: string;
  name: string;
  teacher?: {
    id: string;
  } | null;
}

export default function ClassManagement({ role }: { role?: string }) {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassRecord | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    academicYear: '',
    teacherId: '',
  });

  useEffect(() => {
    loadClasses();
  }, [role]);

  const loadClasses = async () => {
    setIsLoading(true);
    try {
      if (role === 'TEACHER') {
        const response = await api.getTeacherDashboard();
        setClasses(response.teacher?.classes || []);
        return;
      }

      const [classResponse, usersResponse] = await Promise.all([
        api.getClasses(),
        api.getAllUsers(),
      ]);
      setClasses(classResponse.classes || []);
      setTeachers((usersResponse.users || []).filter((user: any) => user.role === 'TEACHER'));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load classes';
      toast.error(message);
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({ name: '', level: '', academicYear: '', teacherId: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.createClass({
        name: formData.name,
        level: formData.level || undefined,
        academicYear: formData.academicYear || undefined,
        teacherId: formData.teacherId || undefined,
      });
      toast.success('Class created successfully');
      handleCloseModal();
      await loadClasses();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create class';
      toast.error(message);
    }
  };

  const getTeacherName = (classItem: ClassRecord) => {
    return classItem.teacher?.user?.name || 'Unassigned';
  };

  const getStudentCount = (classItem: ClassRecord) => {
    return classItem.studentCount ?? classItem.students?.length ?? 0;
  };

  const title = role === 'TEACHER' ? 'My Classes' : 'Class Management';
  const subtitle = role === 'TEACHER'
    ? 'View the classes assigned to you.'
    : 'Manage classes and teacher assignments.';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-card-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        {role === 'ADMIN' && (
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Create Class
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="bg-card rounded-xl p-12 border border-border text-center text-muted-foreground">
          Loading classes...
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-card rounded-xl p-12 border border-border text-center text-muted-foreground">
          No classes available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem, index) => (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedClass(classItem)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                {classItem.level && (
                  <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm">
                    {classItem.level}
                  </span>
                )}
              </div>

              <h3 className="text-card-foreground mb-2">{classItem.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">Teacher: {getTeacherName(classItem)}</p>

              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{getStudentCount(classItem)} students</span>
                </div>
              </div>

              {classItem.academicYear && (
                <p className="text-xs text-muted-foreground mt-3">{classItem.academicYear}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && role === 'ADMIN' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-card-foreground">Create Class</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-card-foreground mb-2">Class Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-card-foreground mb-2">Level</label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-card-foreground mb-2">Academic Year</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-card-foreground mb-2">Assign Teacher</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">Unassigned</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.teacher?.id || ''}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
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

      <AnimatePresence>
        {selectedClass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedClass(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl p-6 w-full max-w-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-card-foreground">{selectedClass.name}</h2>
                  <p className="text-sm text-muted-foreground">Teacher: {getTeacherName(selectedClass)}</p>
                </div>
                <button onClick={() => setSelectedClass(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center py-8 text-muted-foreground">
                {getStudentCount(selectedClass)} students enrolled in this class
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
