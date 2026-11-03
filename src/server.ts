import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { handleRequest, handleTasks } from "./router.ts";
import { type Task, tasks } from "./models/task.models.ts";
import { addTask } from "./models/task.models.ts";
import { sendJson } from "./views/response.view.ts";
import { HttpError } from "./errors/http-errors.ts";

const PORT = process.env.PORT ?? 3000;

// ---------- Server ----------

const server = createServer(
	async (req: IncomingMessage, res: ServerResponse) => {
		// TODO step 2: when the response finishes, log the method, the URL and the status code.
		res.on("finish", () => {
			console.log(
				`Method: ${req.method}. Request URL: ${req.url}. Status Code: ${res.statusCode}`,
			);
		});

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
