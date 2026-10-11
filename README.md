# Task Manager API

In-memory REST API for tasks. Each task has `id` (number), `title` (string), `description` (string), and `completed` (boolean). `priority` (`low`, `medium`, or `high`) is optional. `createdAt` is an ISO date string set by the server when a task is created. Seed tasks do not include either field.

The server listens on port 3000 when started with `npm run dev` or `node app.js`. Don't forget to `npm install` first.

## GET /tasks

List tasks. Results are sorted by `createdAt` ascending. Tasks with a missing or empty `createdAt` stay at the end, in their existing order.

**Query:** `completed=true` or `completed=false` keeps only tasks with that boolean status. Omit it to return every task.

**Success:** `200` and a JSON array. An empty match returns `[]`.

**Invalid filter:** `400` and `{ "error": "completed must be true or false" }`.

```bash
curl http://localhost:3000/tasks
curl "http://localhost:3000/tasks?completed=true"
```

## GET /tasks/priority/:level

List tasks whose `priority` is `low`, `medium`, or `high`. Same sort as `GET /tasks`.

**Success:** `200` and a JSON array. No matches returns `[]`.

**Invalid level:** `400` and `{ "error": "priority must be low, medium, or high" }`.

```bash
curl http://localhost:3000/tasks/priority/high
```

## GET /tasks/:id

Find one task. `id` is a numeric id, sent in the URL as a string.

**Success:** `200` and the task object.

**Missing id:** `404` and `{ "error": "Task not found" }`.

**Non-integer id:** `400` and `{ "error": "id must be an integer" }`.

```bash
curl http://localhost:3000/tasks/1
```

## POST /tasks

Create a task. The next id is assigned automatically.

**Body (all required):**

| Field | Type | Rule |
| --- | --- | --- |
| title | string | required; non-empty, not whitespace only |
| description | string | required; non-empty, not whitespace only |
| completed | boolean | required; `true` or `false`, not the strings `"true"` or `"false"` |
| priority | string | optional; `low`, `medium`, or `high` |

The server sets `createdAt`. Sending `createdAt` in the body is rejected.

**Success:** `201` and the created task, including `id` and `createdAt`. An omitted `priority` is not stored.

**Invalid input:** `400` and `{ "error": "<what to fix>" }`. Any other field is rejected, including `id` and `createdAt`.

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task","description":"New Task Description","completed":false}'
```

## PUT /tasks/:id

Replace `title`, `description`, and `completed`. Those three fields are required. `priority` is optional; omit it to leave the current value unchanged. `createdAt` cannot be changed.

**Body:** same field rules as `POST /tasks`. Unknown fields are rejected.

**Success:** `200` and the updated task.

**Invalid input:** `400` and `{ "error": "<what to fix>" }`.

**Missing id:** `404` and `{ "error": "Task not found" }`.

**Non-integer id:** `400` and `{ "error": "id must be an integer" }`.

```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Task","description":"Updated Task Description","completed":true}'
```

## DELETE /tasks/:id

Remove a task.

**Success:** `200` and the removed task.

**Missing id:** `404` and `{ "error": "Task not found" }`.

**Non-integer id:** `400` and `{ "error": "id must be an integer" }`.

```bash
curl -X DELETE http://localhost:3000/tasks/1
```
