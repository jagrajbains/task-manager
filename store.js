const seed = require('./task.json');

const tasks = seed.tasks.map((task) => ({ ...task }));

/** Return the task with id: number, or undefined. */
function findById(id) {
  return tasks.find((task) => task.id === id);
}

/** Return the next id: number. */
function nextId() {
  return tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
}

module.exports = { tasks, findById, nextId };
