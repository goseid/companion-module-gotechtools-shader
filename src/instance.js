const { InstanceBase, InstanceStatus, Regex } = require('@companion-module/base');

const WsClient = require('./ws-client');
const buildActions = require('./actions');
const buildVariables = require('./variables');
const buildPresets = require('./presets');
const { CONTROL_KEYS, ZERO_STATE } = require('./controls');

class ShaderInstance extends InstanceBase {
  constructor(internal) {
    super(internal);
    this.state = { ...ZERO_STATE };
    this.ws = null;
  }

  async init(config) {
    this.config = config;
    this.updateStatus(InstanceStatus.Connecting);
    this._setupModule();
    this._connectWs();
  }

  async configUpdated(config) {
    this.config = config;
    this._disconnectWs();
    this.updateStatus(InstanceStatus.Connecting);
    this._connectWs();
  }

  async destroy() {
    this._disconnectWs();
  }

  getConfigFields() {
    return [
      {
        type: 'static-text',
        id: 'info',
        label: 'goTech Camera Shader',
        width: 12,
        value:
          'Bind a Companion surface to a goTech Camera Shading Simulator session. ' +
          'Log in at https://gotech.tools/shading/, copy the GUID from the ' +
          '"Connect Bitfocus Companion" panel, and paste it below.',
      },
      {
        type: 'textinput',
        id: 'host',
        label: 'Host',
        tooltip: 'Hostname of the goTech.tools API server.',
        width: 6,
        default: 'gotech.tools',
        regex: Regex.SOMETHING,
      },
      {
        type: 'textinput',
        id: 'guid',
        label: 'Pairing GUID',
        tooltip: 'Copied from the shading page\'s Connect Companion panel.',
        width: 12,
        default: '',
        regex: Regex.SOMETHING,
      },
      {
        type: 'checkbox',
        id: 'insecure',
        label: 'Use plain ws:// (development only)',
        tooltip: 'Off by default — production uses wss://.',
        width: 6,
        default: false,
      },
    ];
  }

  // ─── Internal ───────────────────────────────────────────────────────

  _setupModule() {
    this.setActionDefinitions(buildActions(this));
    this.setVariableDefinitions(buildVariables());
    this.setPresetDefinitions(buildPresets());
    this._publishState();
  }

  _connectWs() {
    if (!this.config || !this.config.guid) {
      this.updateStatus(InstanceStatus.BadConfig, 'Pairing GUID required');
      return;
    }
    this.ws = new WsClient({
      host: this.config.host || 'gotech.tools',
      guid: this.config.guid,
      insecure: !!this.config.insecure,
      onStatus: (status, message) => this.updateStatus(status, message),
      onState: (state) => this._handleRemoteState(state),
      onPeer: (peerType, connected) => this._handlePeer(peerType, connected),
      log: (level, msg) => this.log(level, msg),
    });
    this.ws.connect();
  }

  _disconnectWs() {
    if (this.ws) {
      this.ws.disconnect();
      this.ws = null;
    }
  }

  _handleRemoteState(state) {
    for (const k of CONTROL_KEYS) {
      if (typeof state[k] === 'number') this.state[k] = state[k];
    }
    this._publishState();
  }

  _handlePeer(peerType, connected) {
    if (peerType === 'browser') {
      this.log('info', connected ? 'Browser tab connected.' : 'Browser tab disconnected.');
    }
  }

  _publishState() {
    const vars = {};
    for (const k of CONTROL_KEYS) {
      vars[k] = this.state[k];
      vars[`${k}_signed`] = this.state[k] > 0 ? `+${this.state[k]}` : `${this.state[k]}`;
    }
    this.setVariableValues(vars);
  }

  // ─── Action helpers (called from actions.js) ────────────────────────

  sendSet(key, value) {
    this.ws?.send({ op: 'set', key, value: Number(value) });
  }
  sendDelta(key, delta) {
    this.ws?.send({ op: 'delta', key, delta: Number(delta) });
  }
  sendReset(key) {
    this.ws?.send({ op: 'reset', key });
  }
  sendResetAll() {
    this.ws?.send({ op: 'reset_all' });
  }
}

module.exports = ShaderInstance;
