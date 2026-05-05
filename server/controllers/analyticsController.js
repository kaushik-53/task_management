const Task = require('../models/Task');

exports.getAnalytics = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;

    // Calculate Completed Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = tasks.filter(t => {
      const updated = new Date(t.updatedAt);
      return t.status === 'Completed' && updated >= today;
    }).length;

    // Calculate Most Active Category
    const categoryCounts = {};
    tasks.forEach(t => {
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

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      completedToday,
      mostActiveCategory
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
