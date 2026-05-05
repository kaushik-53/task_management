const Task = require('../models/Task');

const calcPriority = (task) => {
  if (task.status === 'Completed') return 0;
  if (!task.deadline) return 1;

  const now = Date.now();
  const deadline = new Date(task.deadline).getTime();
  const msLeft = deadline - now;

  if (msLeft < 0) return 1000;
  const hoursLeft = msLeft / (1000 * 60 * 60);
  if (hoursLeft < 24) return 100;
  if (hoursLeft < 72) return 50;
  return 10;
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, category, status, deadline } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required.' });

    const task = await Task.create({
      user: req.userId,
      title,
      description,
      category,
      status,
      deadline: deadline || null,
    });

    task.priorityScore = calcPriority(task);
    await task.save();

    req.app.get('io').emit('task:created', task);

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId });

    for (const task of tasks) {
      const newScore = calcPriority(task);
      if (task.priorityScore !== newScore) {
        task.priorityScore = newScore;
        await task.save();
      }
    }

    tasks.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const { title, description, category, status, deadline } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (category !== undefined) task.category = category;
    if (status !== undefined) task.status = status;
    if (deadline !== undefined) task.deadline = deadline || null;

    task.priorityScore = calcPriority(task);
    await task.save();

    req.app.get('io').emit('task:updated', task);

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    req.app.get('io').emit('task:deleted', { _id: req.params.id });

    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
