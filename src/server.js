import { createServer } from 'node:http';

// TODO step 1: read PORT from process.env and fall back to 3000.
const PORT = 3000;

// TODO step 6: create the in-memory "database", a Map for tasks and a nextId counter.

// TODO step 5: create an HttpError class that extends Error and stores a `status`.

// ---------- Response helpers ----------

// TODO step 3: write the status code and the Content-Type header, then send the data as JSON.
function sendJson(res, status, data) {}

// TODO step 9: send a 204 status with no body.
function sendNoContent(res) {}

// TODO step 10: set the Access-Control-Allow-Origin, Methods and Headers headers.
function setCorsHeaders(res) {}

// ---------- Request helpers ----------

// TODO step 7: check the Content-Type header, read the body chunk by chunk, then JSON.parse it.
async function readJsonBody(req) {}

// TODO step 8: check that title is a non-empty string and done is a boolean when present.
function parseTaskInput(body) {}

// ---------- Route handlers ----------

// TODO steps 6 and 7: GET lists all tasks, POST creates one.
async function handleTaskCollection(req, res) {}

// TODO step 9: GET, PUT and DELETE for one task.
async function handleSingleTask(req, res, id) {}

// ---------- Router ----------

// TODO step 4: split the URL path into segments and switch on the resource name.
async function handleRequest(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from a vanilla Node server');
}

// ---------- Server ----------

const server = createServer(async (req, res) => {
  // TODO step 2: when the response finishes, log the method, the URL and the status code.

  // TODO step 5: wrap this call in try/catch and turn errors into JSON responses.
  await handleRequest(req, res);
});

server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
