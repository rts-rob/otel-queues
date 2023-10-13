# Sending OpenTelemetry traces to Baselime from Cloudflare Queues

A simple example that is exactly what it sounds like. Wraps both producer and consumer Workers for [Cloudflare Queues][cloudflare-queues] with [OpenTelemetry][opentelemetry] instrumentation then ships logs and traces to [Baselime][baselime].

## Requirements

* A [Baselime account][baselime-console] 
* A [Cloudflare account][cloudflare-signup] with a Workers subscription (free is fine)

[baselime]: https://baselime.io
[baselime-console]: https://console.baselime.io
[cloudflare-queues]: https://developers.cloudflare.com/queues
[cloudflare-signup]: https://dash.cloudflare.com/sign-up
[opentelemetry]: https://opentelemetry.io/
