import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createTask, updateTask } from '../store/slices/taskSlice';

const CATEGORIES = ['General', 'Work', 'Personal', 'Health', 'Finance', 'Learning', 'Other'];

const defaultForm = {
  title: '',
  description: '',
  category: 'General',
  status: 'Pending',
  deadline: '',
};

export default function TaskForm({ onClose, editTask }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title || '',
        description: editTask.description || '',
        category: editTask.category || 'General',
        status: editTask.status || 'Pending',
        deadline: editTask.deadline
          ? new Date(editTask.deadline).toISOString().slice(0, 16)
          : '',
      });
    }
  }, [editTask]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        deadline: form.deadline || null,
      };
      if (editTask) {
        await dispatch(updateTask({ id: editTask._id, data: payload })).unwrap();
      } else {
        await dispatch(createTask(payload)).unwrap();
      }
      onClose();
    } catch (err) {
      setError(err || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal glass">
        <div className="modal-header">
          <h2 className="modal-title">
            {editTask ? '✏️ Edit Task' : '➕ New Task'}
          </h2>
          <button
            id="modal-close-btn"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} id="task-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              name="title"
              type="text"
              className="form-input"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={handleChange}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              name="description"
              className="form-textarea"
              placeholder="Add more details..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-category">Category</label>
              <select
                id="task-category"
                name="category"
                className="form-select"
                value={form.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-status">Status</label>
              <select
                id="task-status"
                name="status"
                className="form-select"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-deadline">Deadline</label>
            <input
              id="task-deadline"
              name="deadline"
              type="datetime-local"
              className="form-input"
              value={form.deadline}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button
              id="cancel-task-btn"
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              id="submit-task-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : editTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
