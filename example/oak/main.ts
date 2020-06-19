import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Counter, Registry } from "https://deno.land/x/ts_prometheus/mod.ts";

const counter = Counter.with({
  name: "http_requests_total",
  help: "The total HTTP requests",
  labels: ["path", "method", "status"],
});

const app = new Application();

const router = new Router();
router
  .get("/hello", (ctx) => {
    ctx.response.body = "Hello world!";
  })
  .get("/hello/:name", (ctx) => {
    const { params } = ctx;
    ctx.response.body = `Hello, ${params.name}!`;
  })
  .get("/metrics", (ctx) => {
    ctx.response.headers.set("Content-Type", "");
    ctx.response.body = Registry.default.metrics();
  });

app.use(async (ctx, next) => {
  await next();
  counter.labels({
    path: ctx.request.url.pathname,
    method: ctx.request.method,
    status: ctx.response.status || "",
  }).inc();
});

app.use(router.routes());

await app.listen({ port: 8080 });
