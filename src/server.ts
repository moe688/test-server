import { createServer, IncomingMessage, ServerResponse } from "node:http";

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
const updateTask = (task: Task, newTaskTitle: string, newDone: boolean) => {
	const updatedTask: Task = task;
	updatedTask.title = newTaskTitle;
	updatedTask.done = newDone ?? task.done;
	return updatedTask;
};

// TODO step 5: create an HttpError class that extends Error and stores a `status`.
class HttpError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

// ---------- Response helpers ----------

// TODO step 3: write the status code and the Content-Type header, then send the data as JSON.
function sendJson(res: ServerResponse, status: number, data: unknown) {
	const dataAsJson = JSON.stringify(data);
	res.writeHead(status, { "Content-Type": "application/json" });
	res.end(dataAsJson);
}

// TODO step 9: send a 204 status with no body.
function sendNoContent(res: ServerResponse) {
	res.writeHead(204);
	res.end();
}

// TODO step 10: set the Access-Control-Allow-Origin, Methods and Headers headers.
function setCorsHeaders(res: ServerResponse) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, OPTIONS",
	);
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
} // https://www.w3schools.com/nodejs/nodejs_http.asp

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
function parseTaskInput(body: any) {
	const taskTitle = body.title;
	if (typeof taskTitle !== "string")
		throw new HttpError(400, "Title must be a string");
	const cleanTitle = taskTitle.trim();
	if (cleanTitle === "") throw new HttpError(400, "Title must be not empty");
	if (typeof body.done !== "undefined" && typeof body.done !== "boolean")
		throw new HttpError(400, "done must be a boolean");
}

// ---------- Route handlers ----------

async function handleTasks(
	req: IncomingMessage,
	res: ServerResponse,
	path: string[],
) {
	if (path.length === 0) {
		await handleTaskCollection(req, res);
		return;
	}
	const taskId: string = path[0];
	const taskIdAsANumber = Number(taskId);
	const taskIdIsAnInteger = Number.isInteger(taskIdAsANumber);
	if (taskIdIsAnInteger && taskIdAsANumber !== 0) {
		await handleSingleTask(req, res, taskIdAsANumber);
	} else {
		throw new HttpError(400, "Invalid task ID");
	}
}

// TODO steps 6 and 7: GET lists all tasks, POST creates one.
async function handleTaskCollection(req: IncomingMessage, res: ServerResponse) {
	if (req.method === "GET") {
		sendJson(res, 200, Array.from(tasks.values()));
	} else if (req.method === "POST") {
		const body = await readJsonBody(req);
		parseTaskInput(body);

		const newTask = addTask(body.title);
		sendJson(res, 201, newTask);
	} else {
		throw new HttpError(
			405,
			"Method not allowed. Only GET, POST, or DELETE for a specific task",
		);
	}
}

// TODO step 9: GET, PUT and DELETE for one task.
async function handleSingleTask(
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
) {
	if (req.method === "GET") {
		if (tasks.has(id)) {
			sendJson(res, 200, tasks.get(id));
		} else {
			throw new HttpError(405, "No task with such id found");
		}
	} else if (req.method === "PUT") {
		if (tasks.has(id)) {
			const specificTask = tasks.get(id);
			const body = await readJsonBody(req);
			parseTaskInput(body);
			updateTask(specificTask, body.title, body.done);
			sendNoContent(res);
		} else {
			throw new HttpError(405, "No task with such id found");
		}
	} else if (req.method === "DELETE") {
		if (tasks.has(id)) {
			tasks.delete(id);
			sendNoContent(res);
		} else {
			throw new HttpError(405, "No task with such id found");
		}
	}
}

// ---------- Router ----------

// TODO step 4: split the URL path into segments and switch on the resource name.
async function handleRequest(req: IncomingMessage, res: ServerResponse) {
	const url = req.url ?? "/";
	const segments = url.split("/");
	const cleanSegments = segments.filter((segment) => segment.length > 0);
	const [resourceName, ...restOfPath] = cleanSegments;
	switch (resourceName) {
		case "tasks":
			setCorsHeaders(res);
			await handleTasks(req, res, restOfPath);
			break;
		default:
			throw new HttpError(404, "Page not found!");
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
			console.error("caught: ", err);
			if (err instanceof HttpError) {
				sendJson(res, err.status, { error: err.message });
			} else {
				sendJson(res, 500, { error: "Internal server error!" });
			}
		}
	},
);

server.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
	if (!tasks.size) {
		for (let i = 0; i < 15; i++) {
			addTask(`example task number ${i}`);
		}
		console.log("Dummy data added.");
	}
});
