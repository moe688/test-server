# cURL requests

Start the server with `npm run dev`, then paste any block into Postman with Import, Raw text.

Run them in order: later requests use the task with id 1 created by the first one.

## Happy path

Create a task, 201:

```sh
curl -X POST 'http://localhost:3000/tasks' -H 'Content-Type: application/json' -d '{"title": "Learn HTTP"}'
```

List all tasks, 200:

```sh
curl -X GET 'http://localhost:3000/tasks'
```

Read one task, 200:

```sh
curl -X GET 'http://localhost:3000/tasks/1'
```

Replace a task, 200:

```sh
curl -X PUT 'http://localhost:3000/tasks/1' -H 'Content-Type: application/json' -d '{"title": "Learn HTTP", "done": true}'
```

Delete a task, 204:

```sh
curl -X DELETE 'http://localhost:3000/tasks/1'
```

## Errors

Invalid JSON, 400:

```sh
curl -X POST 'http://localhost:3000/tasks' -H 'Content-Type: application/json' -d '{"title": '
```

Failed validation, 400:

```sh
curl -X POST 'http://localhost:3000/tasks' -H 'Content-Type: application/json' -d '{"title": ""}'
```

Task that does not exist, 404:

```sh
curl -X GET 'http://localhost:3000/tasks/999'
```

Route that does not exist, 404:

```sh
curl -X GET 'http://localhost:3000/users'
```

Wrong verb for the route, 405:

```sh
curl -X PATCH 'http://localhost:3000/tasks'
```

Missing Content-Type header, 415:

```sh
curl -X POST 'http://localhost:3000/tasks' -d '{"title": "No header"}'
```

## CORS

Preflight, the request a browser sends before a cross-origin call, 204:

```sh
curl -X OPTIONS 'http://localhost:3000/tasks' -H 'Origin: http://example.com' -H 'Access-Control-Request-Method: POST'
```
