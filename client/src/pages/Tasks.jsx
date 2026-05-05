import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { fetchTasks, socketTaskCreated, socketTaskUpdated, socketTaskDeleted } from '../store/slices/taskSlice';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';

let socket;

export default function Tasks() {
  const dispatch = useDispatch();
  const { items: tasks, loading } = useSelector((state) => state.tasks);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  useEffect(() => {
    socket = io('/', { transports: ['websocket'] });

    socket.on('task:created', (task) => {
      dispatch(socketTaskCreated(task));
      addToast('🆕 New task added in real-time');
    });
    socket.on('task:updated', (task) => {
      dispatch(socketTaskUpdated(task));
    });
    socket.on('task:deleted', (data) => {
      dispatch(socketTaskDeleted(data));
      addToast('🗑️ A task was removed');
    });

    return () => socket.disconnect();
  }, [dispatch]);

  const addToast = useCallback((msg) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const handleEdit = (task) => {
    setEditTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditTask(null);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const overdue = tasks.filter((t) => t.priorityScore >= 1000).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = tasks.filter((t) => {
    const updated = new Date(t.updatedAt || t.createdAt);
    return t.status === 'Completed' && updated >= today;
  }).length;

  const categoryCounts = {};
  tasks.forEach((t) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  let mostActiveCategory = 'None';
  let maxCount = 0;
  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostActiveCategory = category;
    }
  }

  return (
    <>
      <Navbar />

      <main className="tasks-page">
        <div className="tasks-header">
          <div>
            <h1 className="tasks-title">
              My <span>Tasks</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              Sorted by priority • Updates in real-time
            </p>
          </div>
          <button
            id="add-task-btn"
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            + New Task
          </button>
        </div>

        <div className="tasks-stats">
          <div className="stat-card glass">
            <div className="stat-number" style={{ color: 'var(--primary-light)' }}>{total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-number" style={{ color: 'var(--status-completed)' }}>{completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-number" style={{ color: 'var(--status-inprogress)' }}>{inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-number" style={{ color: 'var(--danger)' }}>{overdue}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>

        <div className="tasks-insights" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div className="glass" style={{ flex: 1, minWidth: '250px', padding: '16px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '32px' }}>🏆</div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '2px' }}>Productivity</div>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>You completed <span style={{ color: 'var(--status-completed)' }}>{completedToday}</span> tasks today</div>
            </div>
          </div>
          <div className="glass" style={{ flex: 1, minWidth: '250px', padding: '16px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '32px' }}>📈</div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '2px' }}>Most Active Category</div>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>{mostActiveCategory}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['All', 'Pending', 'In Progress', 'Completed'].map((f) => (
            <button
              key={f}
              id={`filter-${f.replace(' ', '-').toLowerCase()}`}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(f)}
            >
              {f}
              <span style={{
                marginLeft: '4px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '10px',
                padding: '0 6px',
                fontSize: '11px',
              }}>
                {f === 'All' ? total : tasks.filter(t => t.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="page-loader" style={{ minHeight: '300px' }}>
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading tasks...</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h2 className="empty-state-title">
                  {filter === 'All' ? 'No tasks yet' : `No ${filter} tasks`}
                </h2>
                <p className="empty-state-desc">
                  {filter === 'All'
                    ? 'Click "+ New Task" to create your first task.'
                    : 'Tasks with this status will appear here.'}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard key={task._id} task={task} onEdit={handleEdit} />
              ))
            )}
          </div>
        )}
      </main>

      {showForm && <TaskForm onClose={handleCloseForm} editTask={editTask} />}

      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className="toast">{t.msg}</div>
          ))}
        </div>
      )}
    </>
  );
}
