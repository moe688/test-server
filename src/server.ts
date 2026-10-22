import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { setTimeout as sleep } from "node:timers/promises";

// TODO step 1: read PORT from process.env and fall back to 3000.
const PORT = process.env.PORT ?? 3000;
const MAX_BODY_TYPE = 1024 * 1024;

// TODO step 6: create the in-memory "database", a Map for tasks and a nextId counter.

type Task = {
	id: number;
	title: string;
	done: boolean;
};

const tasks = new Map<number, Task>();

let nextId = 1;

const addTask = (taskTitle: string) => {
	const task: Task = { id: nextId, title: taskTitle, done: false };
	tasks.set(nextId, task);
	nextId++;
	return task;
};

// TODO step 5: create an HttpError class that extends Error and stores a `status`.
class HttpError extends Error {
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}

	status: number;
}

// ---------- Response helpers ----------

// TODO step 3: write the status code and the Content-Type header, then send the data as JSON.
function sendJson(res: ServerResponse, status: number, data: unknown) {
	const dataAsJson = JSON.stringify(data);
	res.writeHead(status, { "Content-Type": "application/json" });
	res.end(dataAsJson);
}

// TODO step 9: send a 204 status with no body.
function sendNoContent(res) {}

// TODO step 10: set the Access-Control-Allow-Origin, Methods and Headers headers.
function setCorsHeaders(res) {}

// ---------- Request helpers ----------

// TODO step 7: check the Content-Type header, read the body chunk by chunk, then JSON.parse it.
async function readJsonBody(req: IncomingMessage) {
	if (req.headers["content-type"] !== "application/json") {
		throw new HttpError(415, "content type must be application/json");
	}
	const chunks: Buffer[] = [];
	let recievedBytes = 0;
	for await (const chunk of req) {
		recievedBytes += chunk.length;
		if (recievedBytes > MAX_BODY_TYPE)
			throw new HttpError(413, "Request body too large");
		chunks.push(chunk);
	}
	try {
		return JSON.parse(Buffer.concat(chunks).toString());
	} catch {
		throw new HttpError(400, "Invalid JSON");
	}
}

// TODO step 8: check that title is a non-empty string and done is a boolean when present.
function parseTaskInput(body) {}

// ---------- Route handlers ----------

// TODO steps 6 and 7: GET lists all tasks, POST creates one.
async function handleTaskCollection(req: IncomingMessage, res: ServerResponse) {
	if (req.method === "GET") {
		sendJson(res, 200, Array.from(tasks.values()));
	} else if (req.method === "POST") {
		const body = await readJsonBody(req);

		const newTask = addTask(body.title);
		sendJson(res, 201, newTask);
	} else {
		throw new HttpError(405, "Method not allowed");
	}
}

// TODO step 9: GET, PUT and DELETE for one task.
async function handleSingleTask(req, res, id) {}

// ---------- Router ----------

// TODO step 4: split the URL path into segments and switch on the resource name.
async function handleRequest(req: IncomingMessage, res: ServerResponse) {
	const url = req.url ?? "/";
	const segments = url.split("/");
	const cleanSegments = segments.filter((segment) => segment.length > 0);
	const resourceName = cleanSegments[0];
	switch (resourceName) {
		case "home":
			sendJson(res, 200, { page: "home", value: "homepage" });
			break;
		case "crash":
			throw new Error("Oops, a bug");
		case "tasks":
			await handleTaskCollection(req, res);
			break;
		case "favicon.ico":
			res.writeHead(204);
			res.end();
			break;
		default:
			throw new HttpError(404, "Page not found!@");
	}
}

// ---------- Server ----------

const server = createServer(
	async (req: IncomingMessage, res: ServerResponse) => {
		// TODO step 2: when the response finishes, log the method, the URL and the status code.
		res.on("finish", () => {
			console.log(
				`Method: ${req.method}. Request URL: ${req.url}. Status Code: ${res.statusCode}`,
			);
		});

		// TODO step 5: wrap this call in try/catch and turn errors into JSON responses.
		try {
			await handleRequest(req, res);
		} catch (err) {
			console.log("caught: ", err);
			if (err instanceof HttpError) {
				sendJson(res, err.status, { error: err.message });
			} else {
				sendJson(res, 500, { error: "Internal server error!" });
			}
		}
	},
);

server.listen(PORT, () =>
	console.log(`Server listening on http://localhost:${PORT}`),
);
