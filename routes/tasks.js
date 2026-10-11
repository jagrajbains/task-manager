const express = require('express');
const { tasks, findById, nextId } = require('../store');

const router = express.Router();

const PRIORITIES = ['low', 'medium', 'high'];
const TASK_FIELDS = ['title', 'description', 'completed', 'priority'];

/** Return an error string, or null. title: string, description: string, completed: boolean. priority: string is optional. */
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
  if (body.priority !== undefined && !PRIORITIES.includes(body.priority)) {
    return 'priority must be low, medium, or high';
  }
  return null;
}

/** Compare createdAt: string ascending. Missing or empty values sort last. */
function compareByCreatedAt(a, b) {
  const aMissing = !a.createdAt || Number.isNaN(Date.parse(a.createdAt));
  const bMissing = !b.createdAt || Number.isNaN(Date.parse(b.createdAt));
  if (aMissing && bMissing) {
    return 0;
  }
  if (aMissing) {
    return 1;
  }
  if (bMissing) {
    return -1;
  }
  return Date.parse(a.createdAt) - Date.parse(b.createdAt);
}

function sortedTasks(list) {
  return [...list].sort(compareByCreatedAt);
}

/** Copy optional priority: string onto a task. */
function applyOptionalFields(task, body) {
  if (body.priority !== undefined) {
    task.priority = body.priority;
  }
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
  const { completed } = req.query;
  let list = tasks;
  if (completed !== undefined) {
    if (completed !== 'true' && completed !== 'false') {
      return res.status(400).json({ error: 'completed must be true or false' });
    }
    const isCompleted = completed === 'true';
    list = tasks.filter((task) => task.completed === isCompleted);
  }
  res.status(200).json(sortedTasks(list));
});

router.get('/priority/:level', (req, res) => {
  if (!PRIORITIES.includes(req.params.level)) {
    return res.status(400).json({ error: 'priority must be low, medium, or high' });
  }
  const matches = tasks.filter((task) => task.priority === req.params.level);
  res.status(200).json(sortedTasks(matches));
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
    createdAt: new Date().toISOString(),
  };
  applyOptionalFields(task, req.body);
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
  // priority is a partial update; omit it to keep the current value (low | medium | high).
  task.title = req.body.title;
  task.description = req.body.description;
  task.completed = req.body.completed;
  applyOptionalFields(task, req.body);
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
