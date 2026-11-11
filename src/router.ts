import { IncomingMessage, ServerResponse } from "node:http";

import {
	handleSingleTask,
	handleTaskCollection,
} from "./controllers/task.controller.ts";
import { setCorsHeaders } from "./views/response.view.ts";
import { HttpError } from "./errors/http-errors.ts";

export async function handleRequest(req: IncomingMessage, res: ServerResponse) {
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

export async function handleTasks(
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
