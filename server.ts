import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));

const DATA_FILE = path.join(__dirname, 'portal-storage.json');

// SSE clients set
const clients = new Set<Response>();

// Read data
function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading portal data file:', err);
  }
  return null;
}

// Write data
function writeData(data: unknown) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    // Notify all SSE clients
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) {
      try {
        client.write(payload);
      } catch {
        clients.delete(client);
      }
    }
  } catch (err) {
    console.error('Error writing portal data file:', err);
  }
}

// API Routes
app.get('/api/data', (_req: Request, res: Response) => {
  const data = readData();
  if (data) {
    res.json(data);
  } else {
    res.status(404).json({ error: 'No server data yet' });
  }
});

app.post('/api/data', (req: Request, res: Response) => {
  const data = req.body;
  if (!data || typeof data !== 'object') {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }
  writeData(data);
  res.json({ success: true, timestamp: new Date().toISOString() });
});

// SSE endpoint for instant multi-device real-time sync
app.get('/api/events', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send current data immediately if exists
  const current = readData();
  if (current) {
    res.write(`data: ${JSON.stringify(current)}\n\n`);
  } else {
    res.write(': connected\n\n');
  }

  clients.add(res);

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
      clients.delete(res);
    }
  }, 15000);

  res.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Morphonoveons Portal server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
