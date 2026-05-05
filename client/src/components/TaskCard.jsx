import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateTask, deleteTask } from '../store/slices/taskSlice';

const getPriorityLabel = (score) => {
  if (score >= 1000) return { label: 'OVERDUE', cls: 'priority-overdue' };
  if (score >= 100) return { label: 'HIGH', cls: 'priority-high' };
  if (score >= 50) return { label: 'MEDIUM', cls: 'priority-medium' };
  if (score >= 10) return { label: 'LOW', cls: 'priority-low' };
  return { label: 'NONE', cls: 'priority-none' };
};

const getStatusClass = (status) => {
  if (status === 'In Progress') return 'status-inprogress';
  if (status === 'Completed') return 'status-completed';
  return 'status-pending';
};

const formatDeadline = (deadline) => {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  const isOverdue = d < now;
  const formatted = d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  return { formatted, isOverdue };
};

export default function TaskCard({ task, onEdit }) {
  const dispatch = useDispatch();
  const [deleting, setDeleting] = useState(false);

  const { label, cls } = getPriorityLabel(task.priorityScore);
  const deadlineInfo = formatDeadline(task.deadline);
  const isOverdue = task.priorityScore >= 1000;

  const handleStatusChange = (e) => {
    dispatch(updateTask({ id: task._id, data: { status: e.target.value } }));
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setDeleting(true);
    dispatch(deleteTask(task._id));
  };

  return (
    <div className={`task-card glass ${isOverdue ? 'overdue' : ''}`}>
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`task-priority-badge ${cls}`}>{label}</span>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        {task.category && (
          <span className="task-category">{task.category}</span>
        )}
        {deadlineInfo && (
          <span className={`task-deadline ${deadlineInfo.isOverdue ? 'overdue-text' : ''}`}>
            📅 {deadlineInfo.isOverdue ? 'Overdue: ' : ''}{deadlineInfo.formatted}
          </span>
        )}
      </div>

      <div className="task-card-footer">
        <select
          id={`status-${task._id}`}
          className={`status-select ${getStatusClass(task.status)}`}
          value={task.status}
          onChange={handleStatusChange}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <div className="task-actions">
          <button
            id={`edit-${task._id}`}
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(task)}
          >
            ✏️ Edit
          </button>
          <button
            id={`delete-${task._id}`}
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
