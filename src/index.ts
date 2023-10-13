import { instrument, ResolveConfigFn } from '@microlabs/otel-cf-workers';
import { context, propagation, trace, Tracer, TraceState } from '@opentelemetry/api';

export interface Env {
	MY_QUEUE: Queue;
	BASELIME_API_KEY: string;
}

type TracedRequest = {
	traceParent: Tracer | undefined;
	traceState: TraceState | undefined;
	url: string;
	method: string;
	headers: Object;
}

const handler = {
	async fetch(req: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
		let tracedRequest: TracedRequest = {
			traceParent: undefined,
			traceState: undefined,
			url: req.url,
			method: req.method,
			headers: Object.fromEntries(req.headers),
		}

		propagation.inject(context.active(), tracedRequest);
		
		// Producer Worker - places messages onto the queue
		await env.MY_QUEUE.send(tracedRequest);
		return new Response('Sent traced message to the queue');
	},
	// Consumer Worker - processes batches of messages from the queue
	async queue(batch: MessageBatch<TracedRequest>, _env: Env): Promise<void> {
		for (let message of batch.messages) {
			let activeContext = propagation.extract(context.active(), message.body);
			let tracer = message.body.traceParent;
			if (tracer === undefined) {
				throw new Error("No tracer available.");
			}

			let span = tracer.startSpan(
				'producer_worker',
				{ attributes: {} },
				activeContext,
			);
			trace.setSpan(activeContext, span);
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
