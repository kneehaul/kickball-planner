import { Hono } from 'hono';

type Bindings = {
  // D1, secrets, and other bindings will go here as we add them.
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/api/ping', (c) => c.json({ ok: true, message: 'pong' }));

export default app;
