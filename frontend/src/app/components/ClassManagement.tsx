import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Users, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface Class {
  id: number;
  name: string;
  teacher: string;
  studentCount: number;
  subject: string;
  schedule: string;
}

const initialClasses: Class[] = [
  { id: 1, name: 'Mathematics 101', teacher: 'Jane Smith', studentCount: 30, subject: 'Math', schedule: 'Mon, Wed, Fri - 9:00 AM' },
  { id: 2, name: 'English Literature', teacher: 'Sarah Williams', studentCount: 28, subject: 'English', schedule: 'Tue, Thu - 10:00 AM' },
  { id: 3, name: 'Physics Advanced', teacher: 'Jane Smith', studentCount: 25, subject: 'Science', schedule: 'Mon, Wed - 2:00 PM' },
  { id: 4, name: 'Chemistry Basics', teacher: 'Sarah Williams', studentCount: 32, subject: 'Science', schedule: 'Tue, Thu - 11:00 AM' },
];

const teachers = ['Jane Smith', 'Sarah Williams', 'Mike Johnson', 'Tom Brown'];

export default function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    teacher: teachers[0],
    subject: '',
    schedule: '',
  });

  const handleOpenModal = () => {
    setFormData({ name: '', teacher: teachers[0], subject: '', schedule: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newClass: Class = {
      id: Math.max(...classes.map(c => c.id)) + 1,
      ...formData,
      studentCount: 0,
    };

    setClasses([...classes, newClass]);
    toast.success('Class created successfully');
    handleCloseModal();
  };

  const handleViewStudents = (classItem: Class) => {
    setSelectedClass(classItem);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-card-foreground mb-2">Class Management</h1>
          <p className="text-muted-foreground">Manage classes and student assignments</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Create Class
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem, index) => (
          <motion.div
            key={classItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => handleViewStudents(classItem)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm">
                {classItem.subject}
              </span>
            </div>

            <h3 className="text-card-foreground mb-2">{classItem.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">Teacher: {classItem.teacher}</p>

            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-sm">{classItem.studentCount} students</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3">{classItem.schedule}</p>
          </motion.div>
        ))}
      </div>

      {/* Create Class Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
                <h2 className="text-card-foreground">Create New Class</h2>
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
                    placeholder="e.g., Mathematics 101"
                    required
                  />
                </div>

                <div>
                  <label className="block text-card-foreground mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="e.g., Math, Science, English"
                    required
                  />
                </div>

                <div>
                  <label className="block text-card-foreground mb-2">Assign Teacher</label>
                  <select
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    {teachers.map(teacher => (
                      <option key={teacher} value={teacher}>{teacher}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-card-foreground mb-2">Schedule</label>
                  <input
                    type="text"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="e.g., Mon, Wed, Fri - 9:00 AM"
                    required
                  />
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

      {/* View Students Modal */}
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
                  <p className="text-sm text-muted-foreground">Teacher: {selectedClass.teacher}</p>
                </div>
                <button onClick={() => setSelectedClass(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {selectedClass.studentCount > 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {selectedClass.studentCount} students enrolled in this class
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No students enrolled yet
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
