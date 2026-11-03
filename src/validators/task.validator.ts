import { HttpError } from "../errors/http-errors.ts";
import { type Task } from "../models/task.models.ts";

export function parseTaskInput(body: Task) {
	const taskTitle = body.title;
	if (typeof taskTitle !== "string")
		throw new HttpError(400, "Title must be a string");
	const cleanTitle = taskTitle.trim();
	if (cleanTitle === "") {
		throw new HttpError(400, "Title must be not empty");
	}
	if (typeof body.done !== "undefined" && typeof body.done !== "boolean")
		throw new HttpError(400, "done must be a boolean");
}
