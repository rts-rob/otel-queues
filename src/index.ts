import { instrument, ResolveConfigFn } from '@microlabs/otel-cf-workers';
export interface Env {
	MY_QUEUE: Queue;
	BASELIME_API_KEY: string;
}

const handler = {
	async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Producer Worker - places messages onto the queue
		await env.MY_QUEUE.send({
			url: req.url,
			method: req.method,
			headers: Object.fromEntries(req.headers),
		});
		return new Response('Sent message to the queue');
	},
	// Consumer Worker - processes batches of messages from the queue
	async queue(batch: MessageBatch<Error>, env: Env): Promise<void> {
		for (let message of batch.messages) {
			console.log(`message ${message.id} processed: ${JSON.stringify(message.body)}`);
		}
	},
};

const config: ResolveConfigFn = (env: Env, _trigger) => {
	return {
		exporter: {
			url: 'https://otel.baselime.io/v1',
			headers: { 'x-api-key': env.BASELIME_API_KEY },
		},
		service: { name: 'otel-queues' },
	}
};

export default instrument(handler, config);
