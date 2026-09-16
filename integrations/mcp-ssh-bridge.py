#!/usr/bin/env python3
"""Reconnecting stdio bridge for a remote MCP server reached over SSH.

Usage: mcp-ssh-bridge.py -- ssh [ssh args...] remote-command...

Example profile: integrations/mcp-ssh-bridge.example.json. Keep the real
profile (user, host, key path) in integrations/<name>.local.json; it is ignored.

The MCP host (Claude Code, Claude Desktop, Cursor) speaks MCP over this
process's stdin/stdout. The bridge spawns the ssh
command and forwards newline-delimited JSON-RPC both ways. When the ssh link
dies (laptop sleep, Tailscale rebind, sshd ClientAlive timeout) the bridge
respawns ssh, replays the client's original `initialize` handshake so the fresh
server is usable, fails any requests that were in flight with a JSON-RPC error,
and resumes. Claude never sees the transport close, so its tools stay live.
"""
import asyncio
import json
import os
import sys
import time

BRIDGE_INIT_ID = '__mcp_ssh_bridge_init__'
BACKOFF_START = 1.0
BACKOFF_CAP = 30.0
HANDSHAKE_TIMEOUT = 45.0
REPLAYABLE = {'tools/list', 'prompts/list', 'resources/list', 'resources/templates/list', 'ping'}


def log(msg):
    sys.stderr.write(f'[mcp-ssh-bridge {time.strftime("%H:%M:%S")}] {msg}\n')
    sys.stderr.flush()


class Bridge:
    def __init__(self, cmd):
        self.cmd = cmd
        self.child = None
        self.child_ready = asyncio.Event()  # set when a handshaken child is accepting traffic
        self.init_request = None  # raw bytes of the client's initialize request
        self.initialized_notice = None  # raw bytes of notifications/initialized
        self.pending = {}  # request id -> raw line, requests client sent that have no response yet
        self.closing = False
        self.out_lock = asyncio.Lock()
        self.stdout = None

    async def write_client(self, line: bytes):
        async with self.out_lock:
            self.stdout.write(line)
            await self.stdout.drain()

    async def spawn(self):
        self.child = await asyncio.create_subprocess_exec(
            *self.cmd,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=sys.stderr,
            limit=64 * 1024 * 1024,
        )
        log(f'spawned pid {self.child.pid}')

    async def handshake(self):
        """Replay the stored initialize on a fresh child; swallow its reply."""
        if self.init_request is None:
            return True
        req = json.loads(self.init_request)
        req['id'] = BRIDGE_INIT_ID
        self.child.stdin.write(json.dumps(req).encode() + b'\n')
        await self.child.stdin.drain()
        while True:
            line = await asyncio.wait_for(self.child.stdout.readline(), HANDSHAKE_TIMEOUT)
            if not line:
                return False
            try:
                msg = json.loads(line)
            except ValueError:
                continue
            if msg.get('id') == BRIDGE_INIT_ID:
                if 'error' in msg:
                    log(f'initialize replay rejected: {msg["error"]}')
                    return False
                break
            # anything else from the server before it answers initialize is noise
        if self.initialized_notice:
            self.child.stdin.write(self.initialized_notice)
            await self.child.stdin.drain()
        return True

    async def settle_pending(self):
        """After a reconnect: replay idempotent reads, fail everything else."""
        replay = []
        for rid, line in list(self.pending.items()):
            method = json.loads(line).get('method')
            if method in REPLAYABLE:
                replay.append(line)
                continue
            err = {'jsonrpc': '2.0', 'id': rid,
                   'error': {'code': -32000, 'message': 'SSH link to the MCP server dropped mid-request; the bridge reconnected. Retry the call.'}}
            await self.write_client(json.dumps(err).encode() + b'\n')
            del self.pending[rid]
        for line in replay:
            log(f'replaying {json.loads(line).get("method")}')
            self.child.stdin.write(line)
        if replay:
            await self.child.stdin.drain()

    async def run_child_forever(self):
        backoff = BACKOFF_START
        first = True
        while not self.closing:
            try:
                await self.spawn()
                if not first:
                    ok = await self.handshake()
                    if not ok:
                        raise RuntimeError('handshake failed')
                if not first:
                    await self.settle_pending()
                first = False
                backoff = BACKOFF_START
                self.child_ready.set()
                await self.pump_child_stdout()  # returns when child stdout closes
            except (OSError, RuntimeError, asyncio.TimeoutError) as e:
                log(f'child error: {e}')
            finally:
                self.child_ready.clear()
                if self.child and self.child.returncode is None:
                    try:
                        self.child.kill()
                    except ProcessLookupError:
                        pass
                if self.child:
                    await self.child.wait()
                    log(f'child exited rc={self.child.returncode}')
            if self.closing:
                return
            log(f'reconnecting in {backoff:.0f}s')
            await asyncio.sleep(backoff)
            backoff = min(backoff * 2, BACKOFF_CAP)

    async def pump_child_stdout(self):
        while True:
            line = await self.child.stdout.readline()
            if not line:
                return
            try:
                msg = json.loads(line)
            except ValueError:
                # Not JSON-RPC: a stray print from the remote. Keep stdout clean.
                sys.stderr.write(line.decode(errors='replace'))
                continue
            if 'id' in msg and ('result' in msg or 'error' in msg):
                self.pending.pop(msg['id'], None)
            await self.write_client(line)

    async def pump_client_stdin(self, stdin):
        while True:
            line = await stdin.readline()
            if not line:
                log('client stdin closed; shutting down')
                self.closing = True
                if self.child and self.child.returncode is None:
                    try:
                        self.child.stdin.close()
                    except Exception:
                        pass
                    try:
                        await asyncio.wait_for(self.child.wait(), 3)
                    except asyncio.TimeoutError:
                        self.child.kill()
                return
            try:
                msg = json.loads(line)
            except ValueError:
                continue
            method = msg.get('method')
            if method == 'initialize':
                self.init_request = line
            elif method == 'notifications/initialized':
                self.initialized_notice = line
            if method is not None and 'id' in msg:
                self.pending[msg['id']] = line
            await self.child_ready.wait()
            try:
                self.child.stdin.write(line)
                await self.child.stdin.drain()
            except (BrokenPipeError, ConnectionResetError, OSError) as e:
                log(f'write to child failed: {e}; request will be failed on reconnect')

    async def main(self):
        loop = asyncio.get_running_loop()
        stdin = asyncio.StreamReader(limit=64 * 1024 * 1024)
        await loop.connect_read_pipe(lambda: asyncio.StreamReaderProtocol(stdin), sys.stdin)
        w_transport, w_protocol = await loop.connect_write_pipe(asyncio.streams.FlowControlMixin, os.fdopen(sys.stdout.fileno(), 'wb', 0))
        self.stdout = asyncio.StreamWriter(w_transport, w_protocol, None, loop)
        child_task = asyncio.create_task(self.run_child_forever())
        await self.pump_client_stdin(stdin)
        child_task.cancel()
        try:
            await child_task
        except asyncio.CancelledError:
            pass


def parse_args(argv):
    if '--' in argv:
        argv = argv[argv.index('--') + 1:]
    if not argv:
        sys.exit('usage: mcp-ssh-bridge.py -- ssh [args...] remote-command')
    return argv


if __name__ == '__main__':
    asyncio.run(Bridge(parse_args(sys.argv[1:])).main())
