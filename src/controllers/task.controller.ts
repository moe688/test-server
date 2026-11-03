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

// TODO step 9: GET, PUT and DELETE for one task.
export async function handleSingleTask(
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
) {
	const getMethod = req.method === "GET";
	const putMethod = req.method === "PUT";
	const deleteMethod = req.method === "DELETE";
	const idExist = tasks.has(id);

	if (getMethod && idExist) {
		sendJson(res, 200, tasks.get(id));
	}
	if (putMethod && idExist) {
		const specificTask = tasks.get(id);
		const body = await readJsonBody(req);
		parseTaskInput(body);
		updateTask(specificTask, body.title, body.done);
		sendNoContent(res);
	}
	if (deleteMethod && idExist) {
		tasks.delete(id);
		sendNoContent(res);
	} else {
		throw new HttpError(404, "No task with such id found");
	}
}
