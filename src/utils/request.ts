import { IncomingMessage } from "node:http";
import { HttpError } from "../errors/http-errors.ts";

const MAX_BODY_TYPE = 1024 * 1024;

export async function readJsonBody(req: IncomingMessage) {
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
