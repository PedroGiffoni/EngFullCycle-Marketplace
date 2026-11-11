import { trace, ROOT_CONTEXT, TraceFlags, context } from "@opentelemetry/api";
import {
  BasicTracerProvider,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
const exporter = new OTLPTraceExporter({
  url:
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
    "http://localhost:4318/v1/traces",
});
export const provider = new BasicTracerProvider({
  resource: resourceFromAttributes({
    "service.name": "forma-brasileira",
    "deployment.environment.name": process.env.APP_ENV ?? "development",
  }),
  spanProcessors: [new SimpleSpanProcessor(exporter)],
});
trace.setGlobalTracerProvider(provider);
export const tracer = trace.getTracer("forma-brasileira");
export function parentContext(value: string) {
  const match = /^00-([a-f0-9]{32})-([a-f0-9]{16})-01$/.exec(value);
  return match
    ? trace.setSpanContext(ROOT_CONTEXT, {
        traceId: match[1],
        spanId: match[2],
        traceFlags: TraceFlags.SAMPLED,
        isRemote: true,
      })
    : ROOT_CONTEXT;
}
export { context };
