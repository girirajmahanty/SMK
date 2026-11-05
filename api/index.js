// Vercel serverless function: every /api/* and /uploads/* request is routed here (see vercel.json)
// and handled by the same Express app that server/index.js runs locally.
import app from '../server/app.js';

export default app;
