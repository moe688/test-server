import { IncomingMessage, ServerResponse } from "node:http";
import { sendJson, sendNoContent } from "../views/response.view.ts";
import { tasks, addTask, updateTask } from "../models/task.models.ts";
import { HttpError } from "../errors/http-errors.ts";
import { readJsonBody } from "../utils/request.ts";
import { parseTaskInput } from "../validators/task.validator.ts";

export async function handleTaskCollection(
	req: IncomingMessage,
	res: ServerResponse,
) {
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

export async function handleSingleTask(
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
) {
	const task = tasks.get(id);
	if (!task) {
		throw new HttpError(404, "No task with such id found");
	}
	if (req.method === "GET") {
		sendJson(res, 200, task);
	} else if (req.method === "PUT") {
		const body = await readJsonBody(req);
		parseTaskInput(body);
		updateTask(task, body.title, body.done);
		sendNoContent(res);
	} else if (req.method === "DELETE") {
		tasks.delete(id);
		sendNoContent(res);
	} else {
		throw new HttpError(405, "Method not allowed. Only GET, PUT or DELETE");
	}
}
