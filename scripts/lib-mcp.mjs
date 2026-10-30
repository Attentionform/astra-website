// Tiny MCP stdio client used by the fact and demo generators.
import { spawn } from 'node:child_process';

export function startMcp(serverJs, allowedDir) {
  const child = spawn('node', [serverJs, '--allowed-dir', allowedDir], { stdio: ['pipe', 'pipe', 'ignore'] });
  const pending = new Map();
  let nextId = 1;
  let buf = '';
  child.stdout.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line) continue;
      const msg = JSON.parse(line);
      const p = pending.get(msg.id);
      if (p) { pending.delete(msg.id); if (msg.error) p.reject(new Error(JSON.stringify(msg.error))); else p.resolve(msg.result); }
    }
  });
  const request = (method, params) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      const t = setTimeout(() => { pending.delete(id); reject(new Error(`MCP ${method} timed out`)); }, 60000);
      pending.set(id, { resolve: (v) => { clearTimeout(t); resolve(v); }, reject: (e) => { clearTimeout(t); reject(e); } });
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
  return {
    async init() {
      await request('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'astra-website', version: '0' } });
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
    },
    listTools: () => request('tools/list', {}).then((r) => r.tools),
    call: (name, args) => request('tools/call', { name, arguments: args }),
    close: () => child.kill(),
  };
}
