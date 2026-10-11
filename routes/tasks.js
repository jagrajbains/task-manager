const express = require('express');
const { tasks, findById, nextId } = require('../store');

const router = express.Router();

const TASK_FIELDS = ['title', 'description', 'completed'];

/** Return an error string, or null. title: string, description: string, completed: boolean. */
function validateTask(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return 'body must be a JSON object';
  }
  const unexpected = Object.keys(body).filter((key) => !TASK_FIELDS.includes(key));
  if (unexpected.length > 0) {
    return `unexpected field: ${unexpected.join(', ')}`;
  }
  if (typeof body.title !== 'string' || body.title.trim() === '') {
    return 'title must be a non-empty string';
  }
  if (typeof body.description !== 'string' || body.description.trim() === '') {
    return 'description must be a non-empty string';
  }
  if (typeof body.completed !== 'boolean') {
    return 'completed must be a boolean';
  }
  return null;
}

/** Parse id: string to an integer, or throw. */
function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id)) {
    const error = new Error('id must be an integer');
    error.status = 400;
    throw error;
  }
  return id;
}

router.get('/', (req, res) => {
  res.status(200).json(tasks);
});

router.param('id', (req, res, next, id) => {
  req.id = parseId(id);
  next();
});

router.get('/:id', (req, res) => {
  const task = findById(req.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.status(200).json(task);
});

router.post('/', (req, res) => {
  const error = validateTask(req.body || {});
  if (error) {
    return res.status(400).json({ error });
  }
  const task = {
    id: nextId(),
    title: req.body.title,
    description: req.body.description,
    completed: req.body.completed,
  };
  tasks.push(task);
  res.status(201).json(task);
});

router.put('/:id', (req, res) => {
  const task = findById(req.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  const error = validateTask(req.body || {});
  if (error) {
    return res.status(400).json({ error });
  }
  task.title = req.body.title;
  task.description = req.body.description;
  task.completed = req.body.completed;
  res.status(200).json(task);
});

router.delete('/:id', (req, res) => {
  const index = tasks.findIndex((task) => task.id === req.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  const [removed] = tasks.splice(index, 1);
  res.status(200).json(removed);
});

module.exports = router;
