import { serve } from 'https://deno.land/std@0.175.0/http/server.ts';
import { Context, Hono } from 'https://deno.land/x/hono/mod.ts';
import {
  Counter,
  Registry
} from 'https://deno.land/x/ts_prometheus/mod.ts';

const app = new Hono();

const counter = Counter.with({
  name: 'http_requests_total',
  help: 'The total HTTP requests',
  labels: ['path', 'method', 'status'],
});

// Metrics endpoint
app.get('/metrics', (c: Context): Response => {
  c.set('Content-Type', 'text/plain; version=0.0.4');
  return c.text(Registry.default.metrics(), 200);
});

// Routes following the middleware will be measured
app.use('*', async (c: Context, next): Promise<void> => {
  await next();
  counter.labels({
    path: new URL(c.req.url).pathname,
    method: c.req.method,
    status: c.res.status.toString() || '',
  }).inc();
});

// Hello World route
app.get('/', (c): Response => {
  return c.text('Hello World', 200);
});

serve(app.fetch);