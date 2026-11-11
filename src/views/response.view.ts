import { ServerResponse } from "node:http";

export function sendJson(res: ServerResponse, status: number, data: unknown) {
	const dataAsJson = JSON.stringify(data);
	res.writeHead(status, { "Content-Type": "application/json" });
	res.end(dataAsJson);
}

export function sendNoContent(res: ServerResponse) {
	res.writeHead(204);
	res.end();
}

export function setCorsHeaders(res: ServerResponse) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, OPTIONS",
	);
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
