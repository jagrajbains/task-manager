# Task Manager API

In-memory REST API for tasks. Each task has `id` (number), `title` (string), `description` (string), and `completed` (boolean).

The server listens on port 3000 when started with `npm run dev` or `node app.js`. Don't forget to `npm install` first.

## GET /tasks

List every task.

**Success:** `200` and a JSON array. An empty store returns `[]`.

```bash
curl http://localhost:3000/tasks
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
| title | string | non-empty, not whitespace only |
| description | string | non-empty, not whitespace only |
| completed | boolean | `true` or `false`, not the strings `"true"` or `"false"` |

**Success:** `201` and the created task, including `id`.

**Invalid input:** `400` and `{ "error": "<what to fix>" }`. Any field other than `title`, `description`, and `completed` is rejected, including `id`.

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task","description":"New Task Description","completed":false}'
```

## PUT /tasks/:id

Replace a task. All three body fields are required; partial updates are not accepted.

**Body:** same fields and rules as `POST /tasks`. Unknown fields are rejected.

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
