// Persistent WebSocket connection from the Companion module to the goTech
// shading relay. The browser is the source of truth for control values, so
// this client mostly:
//   1. Authenticates with the configured GUID.
//   2. Sends commands (set / delta / reset / reset_all) from Companion actions.
//   3. Receives the browser's state broadcasts and forwards them up to the
//      Instance so it can update its variables.
//
// Reconnects with exponential backoff while the configured GUID stays valid.

const WebSocket = require('ws');
const { InstanceStatus } = require('@companion-module/base');

const RECONNECT_INITIAL_MS = 2000;
const RECONNECT_MAX_MS = 30000;

class WsClient {
  constructor({ host, guid, insecure, onStatus, onState, onPeer, log }) {
    this.host = host;
    this.guid = guid;
    this.insecure = insecure;
    this.onStatus = onStatus || (() => {});
    this.onState = onState || (() => {});
    this.onPeer = onPeer || (() => {});
    this.log = log || (() => {});

    this.ws = null;
    this.shouldReconnect = false;
    this.reconnectTimer = null;
    this.reconnectDelay = RECONNECT_INITIAL_MS;
  }

  url() {
    const proto = this.insecure ? 'ws:' : 'wss:';
    return `${proto}//${this.host}/api/shading/ws?guid=${encodeURIComponent(this.guid)}`;
  }

  connect() {
    this.shouldReconnect = true;
    this._open();
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try { this.ws.close(1000, 'shutdown'); } catch (_) { /* ignore */ }
      this.ws = null;
    }
  }

  send(payload) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    try {
      this.ws.send(JSON.stringify(payload));
      return true;
    } catch (err) {
      this.log('warn', `send failed: ${err.message}`);
      return false;
    }
  }

  _open() {
    if (this.ws) return;
    const url = this.url();
    this.log('debug', `connecting to ${url}`);
    const ws = new WebSocket(url);
    this.ws = ws;

    ws.on('open', () => {
      this.reconnectDelay = RECONNECT_INITIAL_MS;
      this.onStatus(InstanceStatus.Ok, 'Connected');
      this.log('info', 'Connected to goTech shading relay.');
    });

    ws.on('message', (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); }
      catch { return; }
      this._handleMessage(msg);
    });

    ws.on('close', (code, reason) => {
      this.ws = null;
      const reasonText = reason && reason.length ? ` (${reason.toString()})` : '';
      this.log('warn', `closed: code=${code}${reasonText}`);

      // 1008/1011 etc. include auth failures — surface as bad config.
      if (code === 1008 || code === 4001) {
        this.onStatus(InstanceStatus.AuthenticationFailure, 'Pairing GUID rejected');
        // Don't reconnect — config change required.
        this.shouldReconnect = false;
        return;
      }
      this.onStatus(InstanceStatus.Disconnected, 'Disconnected — retrying');

      if (this.shouldReconnect) this._scheduleReconnect();
    });

    ws.on('unexpected-response', (req, res) => {
      this.log('warn', `WS upgrade rejected with HTTP ${res.statusCode}`);
      if (res.statusCode === 401) {
        this.onStatus(InstanceStatus.AuthenticationFailure, 'Pairing GUID rejected');
        this.shouldReconnect = false;
      }
    });

    ws.on('error', (err) => {
      this.log('warn', `error: ${err.message}`);
    });
  }

  _scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this._open();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, RECONNECT_MAX_MS);
  }

  _handleMessage(msg) {
    if (!msg || typeof msg !== 'object') return;
    switch (msg.op) {
      case 'state':
        if (msg.state) this.onState(msg.state);
        break;
      case 'peer':
        this.onPeer(msg.peerType, !!msg.connected);
        break;
      case 'error':
        this.log('warn', `server error: ${msg.code} ${msg.message || ''}`);
        break;
      // Companion is the *sender* of set/delta/reset/reset_all; we don't
      // expect to receive them, but ignore gracefully if we do.
    }
  }
}

module.exports = WsClient;
