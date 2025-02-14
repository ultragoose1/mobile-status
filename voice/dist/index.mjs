import{createRequire as topLevelCreateRequire}from"module";const require=topLevelCreateRequire(import.meta.url);var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/VoiceConnection.ts
import { EventEmitter as EventEmitter7 } from "node:events";

// src/DataStore.ts
import { GatewayOpcodes } from "discord-api-types/v10";
function createJoinVoiceChannelPayload(config) {
  return {
    op: GatewayOpcodes.VoiceStateUpdate,
    // eslint-disable-next-line id-length
    d: {
      guild_id: config.guildId,
      channel_id: config.channelId,
      self_deaf: config.selfDeaf,
      self_mute: config.selfMute
    }
  };
}
__name(createJoinVoiceChannelPayload, "createJoinVoiceChannelPayload");
var groups = /* @__PURE__ */ new Map();
groups.set("default", /* @__PURE__ */ new Map());
function getOrCreateGroup(group) {
  const existing = groups.get(group);
  if (existing)
    return existing;
  const map = /* @__PURE__ */ new Map();
  groups.set(group, map);
  return map;
}
__name(getOrCreateGroup, "getOrCreateGroup");
function getGroups() {
  return groups;
}
__name(getGroups, "getGroups");
function getVoiceConnections(group = "default") {
  return groups.get(group);
}
__name(getVoiceConnections, "getVoiceConnections");
function getVoiceConnection(guildId, group = "default") {
  return getVoiceConnections(group)?.get(guildId);
}
__name(getVoiceConnection, "getVoiceConnection");
function untrackVoiceConnection(voiceConnection) {
  return getVoiceConnections(voiceConnection.joinConfig.group)?.delete(voiceConnection.joinConfig.guildId);
}
__name(untrackVoiceConnection, "untrackVoiceConnection");
function trackVoiceConnection(voiceConnection) {
  return getOrCreateGroup(voiceConnection.joinConfig.group).set(voiceConnection.joinConfig.guildId, voiceConnection);
}
__name(trackVoiceConnection, "trackVoiceConnection");
var FRAME_LENGTH = 20;
var audioCycleInterval;
var nextTime = -1;
var audioPlayers = [];
function audioCycleStep() {
  if (nextTime === -1)
    return;
  nextTime += FRAME_LENGTH;
  const available = audioPlayers.filter((player) => player.checkPlayable());
  for (const player of available) {
    player["_stepDispatch"]();
  }
  prepareNextAudioFrame(available);
}
__name(audioCycleStep, "audioCycleStep");
function prepareNextAudioFrame(players) {
  const nextPlayer = players.shift();
  if (!nextPlayer) {
    if (nextTime !== -1) {
      audioCycleInterval = setTimeout(() => audioCycleStep(), nextTime - Date.now());
    }
    return;
  }
  nextPlayer["_stepPrepare"]();
  setImmediate(() => prepareNextAudioFrame(players));
}
__name(prepareNextAudioFrame, "prepareNextAudioFrame");
function hasAudioPlayer(target) {
  return audioPlayers.includes(target);
}
__name(hasAudioPlayer, "hasAudioPlayer");
function addAudioPlayer(player) {
  if (hasAudioPlayer(player))
    return player;
  audioPlayers.push(player);
  if (audioPlayers.length === 1) {
    nextTime = Date.now();
    setImmediate(() => audioCycleStep());
  }
  return player;
}
__name(addAudioPlayer, "addAudioPlayer");
function deleteAudioPlayer(player) {
  const index = audioPlayers.indexOf(player);
  if (index === -1)
    return;
  audioPlayers.splice(index, 1);
  if (audioPlayers.length === 0) {
    nextTime = -1;
    if (audioCycleInterval !== void 0)
      clearTimeout(audioCycleInterval);
  }
}
__name(deleteAudioPlayer, "deleteAudioPlayer");

// src/networking/Networking.ts
import { Buffer as Buffer4 } from "node:buffer";
import { EventEmitter as EventEmitter3 } from "node:events";
import { VoiceOpcodes as VoiceOpcodes2 } from "discord-api-types/voice/v4";

// src/util/Secretbox.ts
import { Buffer as Buffer2 } from "node:buffer";
var libs = {
  "sodium-native": (sodium) => ({
    open: (buffer, nonce2, secretKey) => {
      if (buffer) {
        const output = Buffer2.allocUnsafe(buffer.length - sodium.crypto_box_MACBYTES);
        if (sodium.crypto_secretbox_open_easy(output, buffer, nonce2, secretKey))
          return output;
      }
      return null;
    },
    close: (opusPacket, nonce2, secretKey) => {
      const output = Buffer2.allocUnsafe(opusPacket.length + sodium.crypto_box_MACBYTES);
      sodium.crypto_secretbox_easy(output, opusPacket, nonce2, secretKey);
      return output;
    },
    random: (num, buffer = Buffer2.allocUnsafe(num)) => {
      sodium.randombytes_buf(buffer);
      return buffer;
    }
  }),
  sodium: (sodium) => ({
    open: sodium.api.crypto_secretbox_open_easy,
    close: sodium.api.crypto_secretbox_easy,
    random: (num, buffer = Buffer2.allocUnsafe(num)) => {
      sodium.api.randombytes_buf(buffer);
      return buffer;
    }
  }),
  "libsodium-wrappers": (sodium) => ({
    open: sodium.crypto_secretbox_open_easy,
    close: sodium.crypto_secretbox_easy,
    random: sodium.randombytes_buf
  }),
  tweetnacl: (tweetnacl) => ({
    open: tweetnacl.secretbox.open,
    close: tweetnacl.secretbox,
    random: tweetnacl.randomBytes
  })
};
var fallbackError = /* @__PURE__ */ __name(() => {
  throw new Error(
    `Cannot play audio as no valid encryption package is installed.
- Install sodium, libsodium-wrappers, or tweetnacl.
- Use the generateDependencyReport() function for more information.
`
  );
}, "fallbackError");
var methods = {
  open: fallbackError,
  close: fallbackError,
  random: fallbackError
};
void (async () => {
  for (const libName of Object.keys(libs)) {
    try {
      const lib = __require(libName);
      if (libName === "libsodium-wrappers" && lib.ready)
        await lib.ready;
      Object.assign(methods, libs[libName](lib));
      break;
    } catch {
    }
  }
})();

// src/util/util.ts
var noop = /* @__PURE__ */ __name(() => {
}, "noop");

// src/networking/VoiceUDPSocket.ts
import { Buffer as Buffer3 } from "node:buffer";
import { createSocket } from "node:dgram";
import { EventEmitter } from "node:events";
import { isIPv4 } from "node:net";
function parseLocalPacket(message) {
  const packet = Buffer3.from(message);
  const ip = packet.slice(8, packet.indexOf(0, 8)).toString("utf8");
  if (!isIPv4(ip)) {
    throw new Error("Malformed IP address");
  }
  const port = packet.readUInt16BE(packet.length - 2);
  return { ip, port };
}
__name(parseLocalPacket, "parseLocalPacket");
var KEEP_ALIVE_INTERVAL = 5e3;
var MAX_COUNTER_VALUE = 2 ** 32 - 1;
var VoiceUDPSocket = class extends EventEmitter {
  static {
    __name(this, "VoiceUDPSocket");
  }
  /**
   * The underlying network Socket for the VoiceUDPSocket.
   */
  socket;
  /**
   * The socket details for Discord (remote)
   */
  remote;
  /**
   * The counter used in the keep alive mechanism.
   */
  keepAliveCounter = 0;
  /**
   * The buffer used to write the keep alive counter into.
   */
  keepAliveBuffer;
  /**
   * The Node.js interval for the keep-alive mechanism.
   */
  keepAliveInterval;
  /**
   * The time taken to receive a response to keep alive messages.
   *
   * @deprecated This field is no longer updated as keep alive messages are no longer tracked.
   */
  ping;
  /**
   * Creates a new VoiceUDPSocket.
   *
   * @param remote - Details of the remote socket
   */
  constructor(remote) {
    super();
    this.socket = createSocket("udp4");
    this.socket.on("error", (error) => this.emit("error", error));
    this.socket.on("message", (buffer) => this.onMessage(buffer));
    this.socket.on("close", () => this.emit("close"));
    this.remote = remote;
    this.keepAliveBuffer = Buffer3.alloc(8);
    this.keepAliveInterval = setInterval(() => this.keepAlive(), KEEP_ALIVE_INTERVAL);
    setImmediate(() => this.keepAlive());
  }
  /**
   * Called when a message is received on the UDP socket.
   *
   * @param buffer - The received buffer
   */
  onMessage(buffer) {
    this.emit("message", buffer);
  }
  /**
   * Called at a regular interval to check whether we are still able to send datagrams to Discord.
   */
  keepAlive() {
    this.keepAliveBuffer.writeUInt32LE(this.keepAliveCounter, 0);
    this.send(this.keepAliveBuffer);
    this.keepAliveCounter++;
    if (this.keepAliveCounter > MAX_COUNTER_VALUE) {
      this.keepAliveCounter = 0;
    }
  }
  /**
   * Sends a buffer to Discord.
   *
   * @param buffer - The buffer to send
   */
  send(buffer) {
    this.socket.send(buffer, this.remote.port, this.remote.ip);
  }
  /**
   * Closes the socket, the instance will not be able to be reused.
   */
  destroy() {
    try {
      this.socket.close();
    } catch {
    }
    clearInterval(this.keepAliveInterval);
  }
  /**
   * Performs IP discovery to discover the local address and port to be used for the voice connection.
   *
   * @param ssrc - The SSRC received from Discord
   */
  async performIPDiscovery(ssrc) {
    return new Promise((resolve2, reject) => {
      const listener = /* @__PURE__ */ __name((message) => {
        try {
          if (message.readUInt16BE(0) !== 2)
            return;
          const packet = parseLocalPacket(message);
          this.socket.off("message", listener);
          resolve2(packet);
        } catch {
        }
      }, "listener");
      this.socket.on("message", listener);
      this.socket.once("close", () => reject(new Error("Cannot perform IP discovery - socket closed")));
      const discoveryBuffer = Buffer3.alloc(74);
      discoveryBuffer.writeUInt16BE(1, 0);
      discoveryBuffer.writeUInt16BE(70, 2);
      discoveryBuffer.writeUInt32BE(ssrc, 4);
      this.send(discoveryBuffer);
    });
  }
};

// src/networking/VoiceWebSocket.ts
import { EventEmitter as EventEmitter2 } from "node:events";
import { VoiceOpcodes } from "discord-api-types/voice/v4";
import WebSocket from "ws";
var VoiceWebSocket = class extends EventEmitter2 {
  static {
    __name(this, "VoiceWebSocket");
  }
  /**
   * The current heartbeat interval, if any.
   */
  heartbeatInterval;
  /**
   * The time (milliseconds since UNIX epoch) that the last heartbeat acknowledgement packet was received.
   * This is set to 0 if an acknowledgement packet hasn't been received yet.
   */
  lastHeartbeatAck;
  /**
   * The time (milliseconds since UNIX epoch) that the last heartbeat was sent. This is set to 0 if a heartbeat
   * hasn't been sent yet.
   */
  lastHeartbeatSend;
  /**
   * The number of consecutively missed heartbeats.
   */
  missedHeartbeats = 0;
  /**
   * The last recorded ping.
   */
  ping;
  /**
   * The debug logger function, if debugging is enabled.
   */
  debug;
  /**
   * The underlying WebSocket of this wrapper.
   */
  ws;
  /**
   * Creates a new VoiceWebSocket.
   *
   * @param address - The address to connect to
   */
  constructor(address, debug) {
    super();
    this.ws = new WebSocket(address);
    this.ws.onmessage = (err) => this.onMessage(err);
    this.ws.onopen = (err) => this.emit("open", err);
    this.ws.onerror = (err) => this.emit("error", err instanceof Error ? err : err.error);
    this.ws.onclose = (err) => this.emit("close", err);
    this.lastHeartbeatAck = 0;
    this.lastHeartbeatSend = 0;
    this.debug = debug ? (message) => this.emit("debug", message) : null;
  }
  /**
   * Destroys the VoiceWebSocket. The heartbeat interval is cleared, and the connection is closed.
   */
  destroy() {
    try {
      this.debug?.("destroyed");
      this.setHeartbeatInterval(-1);
      this.ws.close(1e3);
    } catch (error) {
      const err = error;
      this.emit("error", err);
    }
  }
  /**
   * Handles message events on the WebSocket. Attempts to JSON parse the messages and emit them
   * as packets.
   *
   * @param event - The message event
   */
  onMessage(event) {
    if (typeof event.data !== "string")
      return;
    this.debug?.(`<< ${event.data}`);
    let packet;
    try {
      packet = JSON.parse(event.data);
    } catch (error) {
      const err = error;
      this.emit("error", err);
      return;
    }
    if (packet.op === VoiceOpcodes.HeartbeatAck) {
      this.lastHeartbeatAck = Date.now();
      this.missedHeartbeats = 0;
      this.ping = this.lastHeartbeatAck - this.lastHeartbeatSend;
    }
    this.emit("packet", packet);
  }
  /**
   * Sends a JSON-stringifiable packet over the WebSocket.
   *
   * @param packet - The packet to send
   */
  sendPacket(packet) {
    try {
      const stringified = JSON.stringify(packet);
      this.debug?.(`>> ${stringified}`);
      this.ws.send(stringified);
    } catch (error) {
      const err = error;
      this.emit("error", err);
    }
  }
  /**
   * Sends a heartbeat over the WebSocket.
   */
  sendHeartbeat() {
    this.lastHeartbeatSend = Date.now();
    this.missedHeartbeats++;
    const nonce2 = this.lastHeartbeatSend;
    this.sendPacket({
      op: VoiceOpcodes.Heartbeat,
      // eslint-disable-next-line id-length
      d: nonce2
    });
  }
  /**
   * Sets/clears an interval to send heartbeats over the WebSocket.
   *
   * @param ms - The interval in milliseconds. If negative, the interval will be unset
   */
  setHeartbeatInterval(ms) {
    if (this.heartbeatInterval !== void 0)
      clearInterval(this.heartbeatInterval);
    if (ms > 0) {
      this.heartbeatInterval = setInterval(() => {
        if (this.lastHeartbeatSend !== 0 && this.missedHeartbeats >= 3) {
          this.ws.close();
          this.setHeartbeatInterval(-1);
        }
        this.sendHeartbeat();
      }, ms);
    }
  }
};

// src/networking/Networking.ts
var CHANNELS = 2;
var TIMESTAMP_INC = 48e3 / 100 * CHANNELS;
var MAX_NONCE_SIZE = 2 ** 32 - 1;
var SUPPORTED_ENCRYPTION_MODES = ["xsalsa20_poly1305_lite", "xsalsa20_poly1305_suffix", "xsalsa20_poly1305"];
var nonce = Buffer4.alloc(24);
function stringifyState(state) {
  return JSON.stringify({
    ...state,
    ws: Reflect.has(state, "ws"),
    udp: Reflect.has(state, "udp")
  });
}
__name(stringifyState, "stringifyState");
function chooseEncryptionMode(options) {
  const option = options.find((option2) => SUPPORTED_ENCRYPTION_MODES.includes(option2));
  if (!option) {
    throw new Error(`No compatible encryption modes. Available include: ${options.join(", ")}`);
  }
  return option;
}
__name(chooseEncryptionMode, "chooseEncryptionMode");
function randomNBit(numberOfBits) {
  return Math.floor(Math.random() * 2 ** numberOfBits);
}
__name(randomNBit, "randomNBit");
var Networking = class extends EventEmitter3 {
  static {
    __name(this, "Networking");
  }
  _state;
  /**
   * The debug logger function, if debugging is enabled.
   */
  debug;
  /**
   * Creates a new Networking instance.
   */
  constructor(options, debug) {
    super();
    this.onWsOpen = this.onWsOpen.bind(this);
    this.onChildError = this.onChildError.bind(this);
    this.onWsPacket = this.onWsPacket.bind(this);
    this.onWsClose = this.onWsClose.bind(this);
    this.onWsDebug = this.onWsDebug.bind(this);
    this.onUdpDebug = this.onUdpDebug.bind(this);
    this.onUdpClose = this.onUdpClose.bind(this);
    this.debug = debug ? (message) => this.emit("debug", message) : null;
    this._state = {
      code: 0 /* OpeningWs */,
      ws: this.createWebSocket(options.endpoint),
      connectionOptions: options
    };
  }
  /**
   * Destroys the Networking instance, transitioning it into the Closed state.
   */
  destroy() {
    this.state = {
      code: 6 /* Closed */
    };
  }
  /**
   * The current state of the networking instance.
   */
  get state() {
    return this._state;
  }
  /**
   * Sets a new state for the networking instance, performing clean-up operations where necessary.
   */
  set state(newState) {
    const oldWs = Reflect.get(this._state, "ws");
    const newWs = Reflect.get(newState, "ws");
    if (oldWs && oldWs !== newWs) {
      oldWs.off("debug", this.onWsDebug);
      oldWs.on("error", noop);
      oldWs.off("error", this.onChildError);
      oldWs.off("open", this.onWsOpen);
      oldWs.off("packet", this.onWsPacket);
      oldWs.off("close", this.onWsClose);
      oldWs.destroy();
    }
    const oldUdp = Reflect.get(this._state, "udp");
    const newUdp = Reflect.get(newState, "udp");
    if (oldUdp && oldUdp !== newUdp) {
      oldUdp.on("error", noop);
      oldUdp.off("error", this.onChildError);
      oldUdp.off("close", this.onUdpClose);
      oldUdp.off("debug", this.onUdpDebug);
      oldUdp.destroy();
    }
    const oldState = this._state;
    this._state = newState;
    this.emit("stateChange", oldState, newState);
    this.debug?.(`state change:
from ${stringifyState(oldState)}
to ${stringifyState(newState)}`);
  }
  /**
   * Creates a new WebSocket to a Discord Voice gateway.
   *
   * @param endpoint - The endpoint to connect to
   */
  createWebSocket(endpoint) {
    const ws = new VoiceWebSocket(`wss://${endpoint}?v=4`, Boolean(this.debug));
    ws.on("error", this.onChildError);
    ws.once("open", this.onWsOpen);
    ws.on("packet", this.onWsPacket);
    ws.once("close", this.onWsClose);
    ws.on("debug", this.onWsDebug);
    return ws;
  }
  /**
   * Propagates errors from the children VoiceWebSocket and VoiceUDPSocket.
   *
   * @param error - The error that was emitted by a child
   */
  onChildError(error) {
    this.emit("error", error);
  }
  /**
   * Called when the WebSocket opens. Depending on the state that the instance is in,
   * it will either identify with a new session, or it will attempt to resume an existing session.
   */
  onWsOpen() {
    if (this.state.code === 0 /* OpeningWs */) {
      const packet = {
        op: VoiceOpcodes2.Identify,
        d: {
          server_id: this.state.connectionOptions.serverId,
          user_id: this.state.connectionOptions.userId,
          session_id: this.state.connectionOptions.sessionId,
          token: this.state.connectionOptions.token
        }
      };
      this.state.ws.sendPacket(packet);
      this.state = {
        ...this.state,
        code: 1 /* Identifying */
      };
    } else if (this.state.code === 5 /* Resuming */) {
      const packet = {
        op: VoiceOpcodes2.Resume,
        d: {
          server_id: this.state.connectionOptions.serverId,
          session_id: this.state.connectionOptions.sessionId,
          token: this.state.connectionOptions.token
        }
      };
      this.state.ws.sendPacket(packet);
    }
  }
  /**
   * Called when the WebSocket closes. Based on the reason for closing (given by the code parameter),
   * the instance will either attempt to resume, or enter the closed state and emit a 'close' event
   * with the close code, allowing the user to decide whether or not they would like to reconnect.
   *
   * @param code - The close code
   */
  onWsClose({ code }) {
    const canResume = code === 4015 || code < 4e3;
    if (canResume && this.state.code === 4 /* Ready */) {
      this.state = {
        ...this.state,
        code: 5 /* Resuming */,
        ws: this.createWebSocket(this.state.connectionOptions.endpoint)
      };
    } else if (this.state.code !== 6 /* Closed */) {
      this.destroy();
      this.emit("close", code);
    }
  }
  /**
   * Called when the UDP socket has closed itself if it has stopped receiving replies from Discord.
   */
  onUdpClose() {
    if (this.state.code === 4 /* Ready */) {
      this.state = {
        ...this.state,
        code: 5 /* Resuming */,
        ws: this.createWebSocket(this.state.connectionOptions.endpoint)
      };
    }
  }
  /**
   * Called when a packet is received on the connection's WebSocket.
   *
   * @param packet - The received packet
   */
  onWsPacket(packet) {
    if (packet.op === VoiceOpcodes2.Hello && this.state.code !== 6 /* Closed */) {
      this.state.ws.setHeartbeatInterval(packet.d.heartbeat_interval);
    } else if (packet.op === VoiceOpcodes2.Ready && this.state.code === 1 /* Identifying */) {
      const { ip, port, ssrc, modes } = packet.d;
      const udp = new VoiceUDPSocket({ ip, port });
      udp.on("error", this.onChildError);
      udp.on("debug", this.onUdpDebug);
      udp.once("close", this.onUdpClose);
      udp.performIPDiscovery(ssrc).then((localConfig) => {
        if (this.state.code !== 2 /* UdpHandshaking */)
          return;
        this.state.ws.sendPacket({
          op: VoiceOpcodes2.SelectProtocol,
          d: {
            protocol: "udp",
            data: {
              address: localConfig.ip,
              port: localConfig.port,
              mode: chooseEncryptionMode(modes)
            }
          }
        });
        this.state = {
          ...this.state,
          code: 3 /* SelectingProtocol */
        };
      }).catch((error) => this.emit("error", error));
      this.state = {
        ...this.state,
        code: 2 /* UdpHandshaking */,
        udp,
        connectionData: {
          ssrc
        }
      };
    } else if (packet.op === VoiceOpcodes2.SessionDescription && this.state.code === 3 /* SelectingProtocol */) {
      const { mode: encryptionMode, secret_key: secretKey } = packet.d;
      this.state = {
        ...this.state,
        code: 4 /* Ready */,
        connectionData: {
          ...this.state.connectionData,
          encryptionMode,
          secretKey: new Uint8Array(secretKey),
          sequence: randomNBit(16),
          timestamp: randomNBit(32),
          nonce: 0,
          nonceBuffer: Buffer4.alloc(24),
          speaking: false,
          packetsPlayed: 0
        }
      };
    } else if (packet.op === VoiceOpcodes2.Resumed && this.state.code === 5 /* Resuming */) {
      this.state = {
        ...this.state,
        code: 4 /* Ready */
      };
      this.state.connectionData.speaking = false;
    }
  }
  /**
   * Propagates debug messages from the child WebSocket.
   *
   * @param message - The emitted debug message
   */
  onWsDebug(message) {
    this.debug?.(`[WS] ${message}`);
  }
  /**
   * Propagates debug messages from the child UDPSocket.
   *
   * @param message - The emitted debug message
   */
  onUdpDebug(message) {
    this.debug?.(`[UDP] ${message}`);
  }
  /**
   * Prepares an Opus packet for playback. This includes attaching metadata to it and encrypting it.
   * It will be stored within the instance, and can be played by dispatchAudio()
   *
   * @remarks
   * Calling this method while there is already a prepared audio packet that has not yet been dispatched
   * will overwrite the existing audio packet. This should be avoided.
   * @param opusPacket - The Opus packet to encrypt
   * @returns The audio packet that was prepared
   */
  prepareAudioPacket(opusPacket) {
    const state = this.state;
    if (state.code !== 4 /* Ready */)
      return;
    state.preparedPacket = this.createAudioPacket(opusPacket, state.connectionData);
    return state.preparedPacket;
  }
  /**
   * Dispatches the audio packet previously prepared by prepareAudioPacket(opusPacket). The audio packet
   * is consumed and cannot be dispatched again.
   */
  dispatchAudio() {
    const state = this.state;
    if (state.code !== 4 /* Ready */)
      return false;
    if (state.preparedPacket !== void 0) {
      this.playAudioPacket(state.preparedPacket);
      state.preparedPacket = void 0;
      return true;
    }
    return false;
  }
  /**
   * Plays an audio packet, updating timing metadata used for playback.
   *
   * @param audioPacket - The audio packet to play
   */
  playAudioPacket(audioPacket) {
    const state = this.state;
    if (state.code !== 4 /* Ready */)
      return;
    const { connectionData } = state;
    connectionData.packetsPlayed++;
    connectionData.sequence++;
    connectionData.timestamp += TIMESTAMP_INC;
    if (connectionData.sequence >= 2 ** 16)
      connectionData.sequence = 0;
    if (connectionData.timestamp >= 2 ** 32)
      connectionData.timestamp = 0;
    this.setSpeaking(true);
    state.udp.send(audioPacket);
  }
  /**
   * Sends a packet to the voice gateway indicating that the client has start/stopped sending
   * audio.
   *
   * @param speaking - Whether or not the client should be shown as speaking
   */
  setSpeaking(speaking) {
    const state = this.state;
    if (state.code !== 4 /* Ready */)
      return;
    if (state.connectionData.speaking === speaking)
      return;
    state.connectionData.speaking = speaking;
    state.ws.sendPacket({
      op: VoiceOpcodes2.Speaking,
      d: {
        speaking: speaking ? 1 : 0,
        delay: 0,
        ssrc: state.connectionData.ssrc
      }
    });
  }
  /**
   * Creates a new audio packet from an Opus packet. This involves encrypting the packet,
   * then prepending a header that includes metadata.
   *
   * @param opusPacket - The Opus packet to prepare
   * @param connectionData - The current connection data of the instance
   */
  createAudioPacket(opusPacket, connectionData) {
    const packetBuffer = Buffer4.alloc(12);
    packetBuffer[0] = 128;
    packetBuffer[1] = 120;
    const { sequence, timestamp, ssrc } = connectionData;
    packetBuffer.writeUIntBE(sequence, 2, 2);
    packetBuffer.writeUIntBE(timestamp, 4, 4);
    packetBuffer.writeUIntBE(ssrc, 8, 4);
    packetBuffer.copy(nonce, 0, 0, 12);
    return Buffer4.concat([packetBuffer, ...this.encryptOpusPacket(opusPacket, connectionData)]);
  }
  /**
   * Encrypts an Opus packet using the format agreed upon by the instance and Discord.
   *
   * @param opusPacket - The Opus packet to encrypt
   * @param connectionData - The current connection data of the instance
   */
  encryptOpusPacket(opusPacket, connectionData) {
    const { secretKey, encryptionMode } = connectionData;
    if (encryptionMode === "xsalsa20_poly1305_lite") {
      connectionData.nonce++;
      if (connectionData.nonce > MAX_NONCE_SIZE)
        connectionData.nonce = 0;
      connectionData.nonceBuffer.writeUInt32BE(connectionData.nonce, 0);
      return [
        methods.close(opusPacket, connectionData.nonceBuffer, secretKey),
        connectionData.nonceBuffer.slice(0, 4)
      ];
    } else if (encryptionMode === "xsalsa20_poly1305_suffix") {
      const random = methods.random(24, connectionData.nonceBuffer);
      return [methods.close(opusPacket, random, secretKey), random];
    }
    return [methods.close(opusPacket, nonce, secretKey)];
  }
};

// src/receive/VoiceReceiver.ts
import { Buffer as Buffer6 } from "node:buffer";
import { VoiceOpcodes as VoiceOpcodes3 } from "discord-api-types/voice/v4";

// src/receive/AudioReceiveStream.ts
import { Readable } from "node:stream";

// src/audio/AudioPlayer.ts
import { Buffer as Buffer5 } from "node:buffer";
import { EventEmitter as EventEmitter4 } from "node:events";

// src/audio/AudioPlayerError.ts
var AudioPlayerError = class extends Error {
  static {
    __name(this, "AudioPlayerError");
  }
  /**
   * The resource associated with the audio player at the time the error was thrown.
   */
  resource;
  constructor(error, resource) {
    super(error.message);
    this.resource = resource;
    this.name = error.name;
    this.stack = error.stack;
  }
};

// src/audio/PlayerSubscription.ts
var PlayerSubscription = class {
  static {
    __name(this, "PlayerSubscription");
  }
  /**
   * The voice connection of this subscription.
   */
  connection;
  /**
   * The audio player of this subscription.
   */
  player;
  constructor(connection, player) {
    this.connection = connection;
    this.player = player;
  }
  /**
   * Unsubscribes the connection from the audio player, meaning that the
   * audio player cannot stream audio to it until a new subscription is made.
   */
  unsubscribe() {
    this.connection["onSubscriptionRemoved"](this);
    this.player["unsubscribe"](this);
  }
};

// src/audio/AudioPlayer.ts
var SILENCE_FRAME = Buffer5.from([248, 255, 254]);
var NoSubscriberBehavior = /* @__PURE__ */ ((NoSubscriberBehavior2) => {
  NoSubscriberBehavior2["Pause"] = "pause";
  NoSubscriberBehavior2["Play"] = "play";
  NoSubscriberBehavior2["Stop"] = "stop";
  return NoSubscriberBehavior2;
})(NoSubscriberBehavior || {});
var AudioPlayerStatus = /* @__PURE__ */ ((AudioPlayerStatus2) => {
  AudioPlayerStatus2["AutoPaused"] = "autopaused";
  AudioPlayerStatus2["Buffering"] = "buffering";
  AudioPlayerStatus2["Idle"] = "idle";
  AudioPlayerStatus2["Paused"] = "paused";
  AudioPlayerStatus2["Playing"] = "playing";
  return AudioPlayerStatus2;
})(AudioPlayerStatus || {});
function stringifyState2(state) {
  return JSON.stringify({
    ...state,
    resource: Reflect.has(state, "resource"),
    stepTimeout: Reflect.has(state, "stepTimeout")
  });
}
__name(stringifyState2, "stringifyState");
var AudioPlayer = class extends EventEmitter4 {
  static {
    __name(this, "AudioPlayer");
  }
  /**
   * The state that the AudioPlayer is in.
   */
  _state;
  /**
   * A list of VoiceConnections that are registered to this AudioPlayer. The player will attempt to play audio
   * to the streams in this list.
   */
  subscribers = [];
  /**
   * The behavior that the player should follow when it enters certain situations.
   */
  behaviors;
  /**
   * The debug logger function, if debugging is enabled.
   */
  debug;
  /**
   * Creates a new AudioPlayer.
   */
  constructor(options = {}) {
    super();
    this._state = { status: "idle" /* Idle */ };
    this.behaviors = {
      noSubscriber: "pause" /* Pause */,
      maxMissedFrames: 5,
      ...options.behaviors
    };
    this.debug = options.debug === false ? null : (message) => this.emit("debug", message);
  }
  /**
   * A list of subscribed voice connections that can currently receive audio to play.
   */
  get playable() {
    return this.subscribers.filter(({ connection }) => connection.state.status === "ready" /* Ready */).map(({ connection }) => connection);
  }
  /**
   * Subscribes a VoiceConnection to the audio player's play list. If the VoiceConnection is already subscribed,
   * then the existing subscription is used.
   *
   * @remarks
   * This method should not be directly called. Instead, use VoiceConnection#subscribe.
   * @param connection - The connection to subscribe
   * @returns The new subscription if the voice connection is not yet subscribed, otherwise the existing subscription
   */
  // @ts-ignore
  subscribe(connection) {
    const existingSubscription = this.subscribers.find((subscription) => subscription.connection === connection);
    if (!existingSubscription) {
      const subscription = new PlayerSubscription(connection, this);
      this.subscribers.push(subscription);
      setImmediate(() => this.emit("subscribe", subscription));
      return subscription;
    }
    return existingSubscription;
  }
  /**
   * Unsubscribes a subscription - i.e. removes a voice connection from the play list of the audio player.
   *
   * @remarks
   * This method should not be directly called. Instead, use PlayerSubscription#unsubscribe.
   * @param subscription - The subscription to remove
   * @returns Whether or not the subscription existed on the player and was removed
   */
  // @ts-ignore
  unsubscribe(subscription) {
    const index = this.subscribers.indexOf(subscription);
    const exists = index !== -1;
    if (exists) {
      this.subscribers.splice(index, 1);
      subscription.connection.setSpeaking(false);
      this.emit("unsubscribe", subscription);
    }
    return exists;
  }
  /**
   * The state that the player is in.
   */
  get state() {
    return this._state;
  }
  /**
   * Sets a new state for the player, performing clean-up operations where necessary.
   */
  set state(newState) {
    const oldState = this._state;
    const newResource = Reflect.get(newState, "resource");
    if (oldState.status !== "idle" /* Idle */ && oldState.resource !== newResource) {
      oldState.resource.playStream.on("error", noop);
      oldState.resource.playStream.off("error", oldState.onStreamError);
      oldState.resource.audioPlayer = void 0;
      oldState.resource.playStream.destroy();
      oldState.resource.playStream.read();
    }
    if (oldState.status === "buffering" /* Buffering */ && (newState.status !== "buffering" /* Buffering */ || newState.resource !== oldState.resource)) {
      oldState.resource.playStream.off("end", oldState.onFailureCallback);
      oldState.resource.playStream.off("close", oldState.onFailureCallback);
      oldState.resource.playStream.off("finish", oldState.onFailureCallback);
      oldState.resource.playStream.off("readable", oldState.onReadableCallback);
    }
    if (newState.status === "idle" /* Idle */) {
      this._signalStopSpeaking();
      deleteAudioPlayer(this);
    }
    if (newResource) {
      addAudioPlayer(this);
    }
    const didChangeResources = oldState.status !== "idle" /* Idle */ && newState.status === "playing" /* Playing */ && oldState.resource !== newState.resource;
    this._state = newState;
    this.emit("stateChange", oldState, this._state);
    if (oldState.status !== newState.status || didChangeResources) {
      this.emit(newState.status, oldState, this._state);
    }
    this.debug?.(`state change:
from ${stringifyState2(oldState)}
to ${stringifyState2(newState)}`);
  }
  /**
   * Plays a new resource on the player. If the player is already playing a resource, the existing resource is destroyed
   * (it cannot be reused, even in another player) and is replaced with the new resource.
   *
   * @remarks
   * The player will transition to the Playing state once playback begins, and will return to the Idle state once
   * playback is ended.
   *
   * If the player was previously playing a resource and this method is called, the player will not transition to the
   * Idle state during the swap over.
   * @param resource - The resource to play
   * @throws Will throw if attempting to play an audio resource that has already ended, or is being played by another player
   */
  play(resource) {
    if (resource.ended) {
      throw new Error("Cannot play a resource that has already ended.");
    }
    if (resource.audioPlayer) {
      if (resource.audioPlayer === this) {
        return;
      }
      throw new Error("Resource is already being played by another audio player.");
    }
    resource.audioPlayer = this;
    const onStreamError = /* @__PURE__ */ __name((error) => {
      if (this.state.status !== "idle" /* Idle */) {
        this.emit("error", new AudioPlayerError(error, this.state.resource));
      }
      if (this.state.status !== "idle" /* Idle */ && this.state.resource === resource) {
        this.state = {
          status: "idle" /* Idle */
        };
      }
    }, "onStreamError");
    resource.playStream.once("error", onStreamError);
    if (resource.started) {
      this.state = {
        status: "playing" /* Playing */,
        missedFrames: 0,
        playbackDuration: 0,
        resource,
        onStreamError
      };
    } else {
      const onReadableCallback = /* @__PURE__ */ __name(() => {
        if (this.state.status === "buffering" /* Buffering */ && this.state.resource === resource) {
          this.state = {
            status: "playing" /* Playing */,
            missedFrames: 0,
            playbackDuration: 0,
            resource,
            onStreamError
          };
        }
      }, "onReadableCallback");
      const onFailureCallback = /* @__PURE__ */ __name(() => {
        if (this.state.status === "buffering" /* Buffering */ && this.state.resource === resource) {
          this.state = {
            status: "idle" /* Idle */
          };
        }
      }, "onFailureCallback");
      resource.playStream.once("readable", onReadableCallback);
      resource.playStream.once("end", onFailureCallback);
      resource.playStream.once("close", onFailureCallback);
      resource.playStream.once("finish", onFailureCallback);
      this.state = {
        status: "buffering" /* Buffering */,
        resource,
        onReadableCallback,
        onFailureCallback,
        onStreamError
      };
    }
  }
  /**
   * Pauses playback of the current resource, if any.
   *
   * @param interpolateSilence - If true, the player will play 5 packets of silence after pausing to prevent audio glitches
   * @returns `true` if the player was successfully paused, otherwise `false`
   */
  pause(interpolateSilence = true) {
    if (this.state.status !== "playing" /* Playing */)
      return false;
    this.state = {
      ...this.state,
      status: "paused" /* Paused */,
      silencePacketsRemaining: interpolateSilence ? 5 : 0
    };
    return true;
  }
  /**
   * Unpauses playback of the current resource, if any.
   *
   * @returns `true` if the player was successfully unpaused, otherwise `false`
   */
  unpause() {
    if (this.state.status !== "paused" /* Paused */)
      return false;
    this.state = {
      ...this.state,
      status: "playing" /* Playing */,
      missedFrames: 0
    };
    return true;
  }
  /**
   * Stops playback of the current resource and destroys the resource. The player will either transition to the Idle state,
   * or remain in its current state until the silence padding frames of the resource have been played.
   *
   * @param force - If true, will force the player to enter the Idle state even if the resource has silence padding frames
   * @returns `true` if the player will come to a stop, otherwise `false`
   */
  stop(force = false) {
    if (this.state.status === "idle" /* Idle */)
      return false;
    if (force || this.state.resource.silencePaddingFrames === 0) {
      this.state = {
        status: "idle" /* Idle */
      };
    } else if (this.state.resource.silenceRemaining === -1) {
      this.state.resource.silenceRemaining = this.state.resource.silencePaddingFrames;
    }
    return true;
  }
  /**
   * Checks whether the underlying resource (if any) is playable (readable)
   *
   * @returns `true` if the resource is playable, otherwise `false`
   */
  checkPlayable() {
    const state = this._state;
    if (state.status === "idle" /* Idle */ || state.status === "buffering" /* Buffering */)
      return false;
    if (!state.resource.readable) {
      this.state = {
        status: "idle" /* Idle */
      };
      return false;
    }
    return true;
  }
  /**
   * Called roughly every 20ms by the global audio player timer. Dispatches any audio packets that are buffered
   * by the active connections of this audio player.
   */
  // @ts-ignore
  _stepDispatch() {
    const state = this._state;
    if (state.status === "idle" /* Idle */ || state.status === "buffering" /* Buffering */)
      return;
    for (const connection of this.playable) {
      connection.dispatchAudio();
    }
  }
  /**
   * Called roughly every 20ms by the global audio player timer. Attempts to read an audio packet from the
   * underlying resource of the stream, and then has all the active connections of the audio player prepare it
   * (encrypt it, append header data) so that it is ready to play at the start of the next cycle.
   */
  // @ts-ignore
  _stepPrepare() {
    const state = this._state;
    if (state.status === "idle" /* Idle */ || state.status === "buffering" /* Buffering */)
      return;
    const playable = this.playable;
    if (state.status === "autopaused" /* AutoPaused */ && playable.length > 0) {
      this.state = {
        ...state,
        status: "playing" /* Playing */,
        missedFrames: 0
      };
    }
    if (state.status === "paused" /* Paused */ || state.status === "autopaused" /* AutoPaused */) {
      if (state.silencePacketsRemaining > 0) {
        state.silencePacketsRemaining--;
        this._preparePacket(SILENCE_FRAME, playable, state);
        if (state.silencePacketsRemaining === 0) {
          this._signalStopSpeaking();
        }
      }
      return;
    }
    if (playable.length === 0) {
      if (this.behaviors.noSubscriber === "pause" /* Pause */) {
        this.state = {
          ...state,
          status: "autopaused" /* AutoPaused */,
          silencePacketsRemaining: 5
        };
        return;
      } else if (this.behaviors.noSubscriber === "stop" /* Stop */) {
        this.stop(true);
      }
    }
    const packet = state.resource.read();
    if (state.status === "playing" /* Playing */) {
      if (packet) {
        this._preparePacket(packet, playable, state);
        state.missedFrames = 0;
      } else {
        this._preparePacket(SILENCE_FRAME, playable, state);
        state.missedFrames++;
        if (state.missedFrames >= this.behaviors.maxMissedFrames) {
          this.stop();
        }
      }
    }
  }
  /**
   * Signals to all the subscribed connections that they should send a packet to Discord indicating
   * they are no longer speaking. Called once playback of a resource ends.
   */
  _signalStopSpeaking() {
    for (const { connection } of this.subscribers) {
      connection.setSpeaking(false);
    }
  }
  /**
   * Instructs the given connections to each prepare this packet to be played at the start of the
   * next cycle.
   *
   * @param packet - The Opus packet to be prepared by each receiver
   * @param receivers - The connections that should play this packet
   */
  _preparePacket(packet, receivers, state) {
    state.playbackDuration += 20;
    for (const connection of receivers) {
      connection.prepareAudioPacket(packet);
    }
  }
};
function createAudioPlayer(options) {
  return new AudioPlayer(options);
}
__name(createAudioPlayer, "createAudioPlayer");

// src/receive/AudioReceiveStream.ts
var EndBehaviorType = /* @__PURE__ */ ((EndBehaviorType2) => {
  EndBehaviorType2[EndBehaviorType2["Manual"] = 0] = "Manual";
  EndBehaviorType2[EndBehaviorType2["AfterSilence"] = 1] = "AfterSilence";
  EndBehaviorType2[EndBehaviorType2["AfterInactivity"] = 2] = "AfterInactivity";
  return EndBehaviorType2;
})(EndBehaviorType || {});
function createDefaultAudioReceiveStreamOptions() {
  return {
    end: {
      behavior: 0 /* Manual */
    }
  };
}
__name(createDefaultAudioReceiveStreamOptions, "createDefaultAudioReceiveStreamOptions");
var AudioReceiveStream = class extends Readable {
  static {
    __name(this, "AudioReceiveStream");
  }
  /**
   * The end behavior of the receive stream.
   */
  end;
  endTimeout;
  constructor({ end, ...options }) {
    super({
      ...options,
      objectMode: true
    });
    this.end = end;
  }
  push(buffer) {
    if (buffer && (this.end.behavior === 2 /* AfterInactivity */ || this.end.behavior === 1 /* AfterSilence */ && (buffer.compare(SILENCE_FRAME) !== 0 || this.endTimeout === void 0))) {
      this.renewEndTimeout(this.end);
    }
    return super.push(buffer);
  }
  renewEndTimeout(end) {
    if (this.endTimeout) {
      clearTimeout(this.endTimeout);
    }
    this.endTimeout = setTimeout(() => this.push(null), end.duration);
  }
  _read() {
  }
};

// src/receive/SSRCMap.ts
import { EventEmitter as EventEmitter5 } from "node:events";
var SSRCMap = class extends EventEmitter5 {
  static {
    __name(this, "SSRCMap");
  }
  /**
   * The underlying map.
   */
  map;
  constructor() {
    super();
    this.map = /* @__PURE__ */ new Map();
  }
  /**
   * Updates the map with new user data
   *
   * @param data - The data to update with
   */
  update(data) {
    const existing = this.map.get(data.audioSSRC);
    const newValue = {
      ...this.map.get(data.audioSSRC),
      ...data
    };
    this.map.set(data.audioSSRC, newValue);
    if (!existing)
      this.emit("create", newValue);
    this.emit("update", existing, newValue);
  }
  /**
   * Gets the stored voice data of a user.
   *
   * @param target - The target, either their user id or audio SSRC
   */
  get(target) {
    if (typeof target === "number") {
      return this.map.get(target);
    }
    for (const data of this.map.values()) {
      if (data.userId === target) {
        return data;
      }
    }
    return void 0;
  }
  /**
   * Deletes the stored voice data about a user.
   *
   * @param target - The target of the delete operation, either their audio SSRC or user id
   * @returns The data that was deleted, if any
   */
  delete(target) {
    if (typeof target === "number") {
      const existing = this.map.get(target);
      if (existing) {
        this.map.delete(target);
        this.emit("delete", existing);
      }
      return existing;
    }
    for (const [audioSSRC, data] of this.map.entries()) {
      if (data.userId === target) {
        this.map.delete(audioSSRC);
        this.emit("delete", data);
        return data;
      }
    }
    return void 0;
  }
};

// src/receive/SpeakingMap.ts
import { EventEmitter as EventEmitter6 } from "node:events";
var SpeakingMap = class _SpeakingMap extends EventEmitter6 {
  static {
    __name(this, "SpeakingMap");
  }
  /**
   * The delay after a packet is received from a user until they're marked as not speaking anymore.
   */
  static DELAY = 100;
  /**
   * The currently speaking users, mapped to the milliseconds since UNIX epoch at which they started speaking.
   */
  users;
  speakingTimeouts;
  constructor() {
    super();
    this.users = /* @__PURE__ */ new Map();
    this.speakingTimeouts = /* @__PURE__ */ new Map();
  }
  onPacket(userId) {
    const timeout = this.speakingTimeouts.get(userId);
    if (timeout) {
      clearTimeout(timeout);
    } else {
      this.users.set(userId, Date.now());
      this.emit("start", userId);
    }
    this.startTimeout(userId);
  }
  startTimeout(userId) {
    this.speakingTimeouts.set(
      userId,
      setTimeout(() => {
        this.emit("end", userId);
        this.speakingTimeouts.delete(userId);
        this.users.delete(userId);
      }, _SpeakingMap.DELAY)
    );
  }
};

// src/receive/VoiceReceiver.ts
var VoiceReceiver = class {
  static {
    __name(this, "VoiceReceiver");
  }
  /**
   * The attached connection of this receiver.
   */
  voiceConnection;
  /**
   * Maps SSRCs to Discord user ids.
   */
  ssrcMap;
  /**
   * The current audio subscriptions of this receiver.
   */
  subscriptions;
  /**
   * The connection data of the receiver.
   *
   * @internal
   */
  connectionData;
  /**
   * The speaking map of the receiver.
   */
  speaking;
  constructor(voiceConnection) {
    this.voiceConnection = voiceConnection;
    this.ssrcMap = new SSRCMap();
    this.speaking = new SpeakingMap();
    this.subscriptions = /* @__PURE__ */ new Map();
    this.connectionData = {};
    this.onWsPacket = this.onWsPacket.bind(this);
    this.onUdpMessage = this.onUdpMessage.bind(this);
  }
  /**
   * Called when a packet is received on the attached connection's WebSocket.
   *
   * @param packet - The received packet
   * @internal
   */
  onWsPacket(packet) {
    if (packet.op === VoiceOpcodes3.ClientDisconnect && typeof packet.d?.user_id === "string") {
      this.ssrcMap.delete(packet.d.user_id);
    } else if (packet.op === VoiceOpcodes3.Speaking && typeof packet.d?.user_id === "string" && typeof packet.d?.ssrc === "number") {
      this.ssrcMap.update({ userId: packet.d.user_id, audioSSRC: packet.d.ssrc });
    } else if (packet.op === VoiceOpcodes3.ClientConnect && typeof packet.d?.user_id === "string" && typeof packet.d?.audio_ssrc === "number") {
      this.ssrcMap.update({
        userId: packet.d.user_id,
        audioSSRC: packet.d.audio_ssrc,
        videoSSRC: packet.d.video_ssrc === 0 ? void 0 : packet.d.video_ssrc
      });
    }
  }
  decrypt(buffer, mode, nonce2, secretKey) {
    let end;
    if (mode === "xsalsa20_poly1305_lite") {
      buffer.copy(nonce2, 0, buffer.length - 4);
      end = buffer.length - 4;
    } else if (mode === "xsalsa20_poly1305_suffix") {
      buffer.copy(nonce2, 0, buffer.length - 24);
      end = buffer.length - 24;
    } else {
      buffer.copy(nonce2, 0, 0, 12);
    }
    const decrypted = methods.open(buffer.slice(12, end), nonce2, secretKey);
    if (!decrypted)
      return;
    return Buffer6.from(decrypted);
  }
  /**
   * Parses an audio packet, decrypting it to yield an Opus packet.
   *
   * @param buffer - The buffer to parse
   * @param mode - The encryption mode
   * @param nonce - The nonce buffer used by the connection for encryption
   * @param secretKey - The secret key used by the connection for encryption
   * @returns The parsed Opus packet
   */
  parsePacket(buffer, mode, nonce2, secretKey) {
    let packet = this.decrypt(buffer, mode, nonce2, secretKey);
    if (!packet)
      return;
    if (packet[0] === 190 && packet[1] === 222) {
      const headerExtensionLength = packet.readUInt16BE(2);
      packet = packet.subarray(4 + 4 * headerExtensionLength);
    }
    return packet;
  }
  /**
   * Called when the UDP socket of the attached connection receives a message.
   *
   * @param msg - The received message
   * @internal
   */
  onUdpMessage(msg) {
    if (msg.length <= 8)
      return;
    const ssrc = msg.readUInt32BE(8);
    const userData = this.ssrcMap.get(ssrc);
    if (!userData)
      return;
    this.speaking.onPacket(userData.userId);
    const stream = this.subscriptions.get(userData.userId);
    if (!stream)
      return;
    if (this.connectionData.encryptionMode && this.connectionData.nonceBuffer && this.connectionData.secretKey) {
      const packet = this.parsePacket(
        msg,
        this.connectionData.encryptionMode,
        this.connectionData.nonceBuffer,
        this.connectionData.secretKey
      );
      if (packet) {
        stream.push(packet);
      } else {
        stream.destroy(new Error("Failed to parse packet"));
      }
    }
  }
  /**
   * Creates a subscription for the given user id.
   *
   * @param target - The id of the user to subscribe to
   * @returns A readable stream of Opus packets received from the target
   */
  subscribe(userId, options) {
    const existing = this.subscriptions.get(userId);
    if (existing)
      return existing;
    const stream = new AudioReceiveStream({
      ...createDefaultAudioReceiveStreamOptions(),
      ...options
    });
    stream.once("close", () => this.subscriptions.delete(userId));
    this.subscriptions.set(userId, stream);
    return stream;
  }
};

// src/VoiceConnection.ts
var VoiceConnectionStatus = /* @__PURE__ */ ((VoiceConnectionStatus2) => {
  VoiceConnectionStatus2["Connecting"] = "connecting";
  VoiceConnectionStatus2["Destroyed"] = "destroyed";
  VoiceConnectionStatus2["Disconnected"] = "disconnected";
  VoiceConnectionStatus2["Ready"] = "ready";
  VoiceConnectionStatus2["Signalling"] = "signalling";
  return VoiceConnectionStatus2;
})(VoiceConnectionStatus || {});
var VoiceConnectionDisconnectReason = /* @__PURE__ */ ((VoiceConnectionDisconnectReason2) => {
  VoiceConnectionDisconnectReason2[VoiceConnectionDisconnectReason2["WebSocketClose"] = 0] = "WebSocketClose";
  VoiceConnectionDisconnectReason2[VoiceConnectionDisconnectReason2["AdapterUnavailable"] = 1] = "AdapterUnavailable";
  VoiceConnectionDisconnectReason2[VoiceConnectionDisconnectReason2["EndpointRemoved"] = 2] = "EndpointRemoved";
  VoiceConnectionDisconnectReason2[VoiceConnectionDisconnectReason2["Manual"] = 3] = "Manual";
  return VoiceConnectionDisconnectReason2;
})(VoiceConnectionDisconnectReason || {});
var VoiceConnection = class extends EventEmitter7 {
  static {
    __name(this, "VoiceConnection");
  }
  /**
   * The number of consecutive rejoin attempts. Initially 0, and increments for each rejoin.
   * When a connection is successfully established, it resets to 0.
   */
  rejoinAttempts;
  /**
   * The state of the voice connection.
   */
  _state;
  /**
   * A configuration storing all the data needed to reconnect to a Guild's voice server.
   *
   * @internal
   */
  joinConfig;
  /**
   * The two packets needed to successfully establish a voice connection. They are received
   * from the main Discord gateway after signalling to change the voice state.
   */
  packets;
  /**
   * The receiver of this voice connection. You should join the voice channel with `selfDeaf` set
   * to false for this feature to work properly.
   */
  receiver;
  /**
   * The debug logger function, if debugging is enabled.
   */
  debug;
  /**
   * Creates a new voice connection.
   *
   * @param joinConfig - The data required to establish the voice connection
   * @param options - The options used to create this voice connection
   */
  constructor(joinConfig, options) {
    super();
    this.debug = options.debug ? (message) => this.emit("debug", message) : null;
    this.rejoinAttempts = 0;
    this.receiver = new VoiceReceiver(this);
    this.onNetworkingClose = this.onNetworkingClose.bind(this);
    this.onNetworkingStateChange = this.onNetworkingStateChange.bind(this);
    this.onNetworkingError = this.onNetworkingError.bind(this);
    this.onNetworkingDebug = this.onNetworkingDebug.bind(this);
    const adapter = options.adapterCreator({
      onVoiceServerUpdate: (data) => this.addServerPacket(data),
      onVoiceStateUpdate: (data) => this.addStatePacket(data),
      destroy: () => this.destroy(false)
    });
    this._state = { status: "signalling" /* Signalling */, adapter };
    this.packets = {
      server: void 0,
      state: void 0
    };
    this.joinConfig = joinConfig;
  }
  /**
   * The current state of the voice connection.
   */
  get state() {
    return this._state;
  }
  /**
   * Updates the state of the voice connection, performing clean-up operations where necessary.
   */
  set state(newState) {
    const oldState = this._state;
    const oldNetworking = Reflect.get(oldState, "networking");
    const newNetworking = Reflect.get(newState, "networking");
    const oldSubscription = Reflect.get(oldState, "subscription");
    const newSubscription = Reflect.get(newState, "subscription");
    if (oldNetworking !== newNetworking) {
      if (oldNetworking) {
        oldNetworking.on("error", noop);
        oldNetworking.off("debug", this.onNetworkingDebug);
        oldNetworking.off("error", this.onNetworkingError);
        oldNetworking.off("close", this.onNetworkingClose);
        oldNetworking.off("stateChange", this.onNetworkingStateChange);
        oldNetworking.destroy();
      }
      if (newNetworking)
        this.updateReceiveBindings(newNetworking.state, oldNetworking?.state);
    }
    if (newState.status === "ready" /* Ready */) {
      this.rejoinAttempts = 0;
    } else if (newState.status === "destroyed" /* Destroyed */) {
      for (const stream of this.receiver.subscriptions.values()) {
        if (!stream.destroyed)
          stream.destroy();
      }
    }
    if (oldState.status !== "destroyed" /* Destroyed */ && newState.status === "destroyed" /* Destroyed */) {
      oldState.adapter.destroy();
    }
    this._state = newState;
    if (oldSubscription && oldSubscription !== newSubscription) {
      oldSubscription.unsubscribe();
    }
    this.emit("stateChange", oldState, newState);
    if (oldState.status !== newState.status) {
      this.emit(newState.status, oldState, newState);
    }
  }
  /**
   * Registers a `VOICE_SERVER_UPDATE` packet to the voice connection. This will cause it to reconnect using the
   * new data provided in the packet.
   *
   * @param packet - The received `VOICE_SERVER_UPDATE` packet
   */
  addServerPacket(packet) {
    this.packets.server = packet;
    if (packet.endpoint) {
      this.configureNetworking();
    } else if (this.state.status !== "destroyed" /* Destroyed */) {
      this.state = {
        ...this.state,
        status: "disconnected" /* Disconnected */,
        reason: 2 /* EndpointRemoved */
      };
    }
  }
  /**
   * Registers a `VOICE_STATE_UPDATE` packet to the voice connection. Most importantly, it stores the id of the
   * channel that the client is connected to.
   *
   * @param packet - The received `VOICE_STATE_UPDATE` packet
   */
  addStatePacket(packet) {
    this.packets.state = packet;
    if (packet.self_deaf !== void 0)
      this.joinConfig.selfDeaf = packet.self_deaf;
    if (packet.self_mute !== void 0)
      this.joinConfig.selfMute = packet.self_mute;
    if (packet.channel_id)
      this.joinConfig.channelId = packet.channel_id;
  }
  /**
   * Called when the networking state changes, and the new ws/udp packet/message handlers need to be rebound
   * to the new instances.
   *
   * @param newState - The new networking state
   * @param oldState - The old networking state, if there is one
   */
  updateReceiveBindings(newState, oldState) {
    const oldWs = Reflect.get(oldState ?? {}, "ws");
    const newWs = Reflect.get(newState, "ws");
    const oldUdp = Reflect.get(oldState ?? {}, "udp");
    const newUdp = Reflect.get(newState, "udp");
    if (oldWs !== newWs) {
      oldWs?.off("packet", this.receiver.onWsPacket);
      newWs?.on("packet", this.receiver.onWsPacket);
    }
    if (oldUdp !== newUdp) {
      oldUdp?.off("message", this.receiver.onUdpMessage);
      newUdp?.on("message", this.receiver.onUdpMessage);
    }
    this.receiver.connectionData = Reflect.get(newState, "connectionData") ?? {};
  }
  /**
   * Attempts to configure a networking instance for this voice connection using the received packets.
   * Both packets are required, and any existing networking instance will be destroyed.
   *
   * @remarks
   * This is called when the voice server of the connection changes, e.g. if the bot is moved into a
   * different channel in the same guild but has a different voice server. In this instance, the connection
   * needs to be re-established to the new voice server.
   *
   * The connection will transition to the Connecting state when this is called.
   */
  configureNetworking() {
    const { server, state } = this.packets;
    if (!server || !state || this.state.status === "destroyed" /* Destroyed */ || !server.endpoint)
      return;
    const networking = new Networking(
      {
        endpoint: server.endpoint,
        serverId: server.guild_id,
        token: server.token,
        sessionId: state.session_id,
        userId: state.user_id
      },
      Boolean(this.debug)
    );
    networking.once("close", this.onNetworkingClose);
    networking.on("stateChange", this.onNetworkingStateChange);
    networking.on("error", this.onNetworkingError);
    networking.on("debug", this.onNetworkingDebug);
    this.state = {
      ...this.state,
      status: "connecting" /* Connecting */,
      networking
    };
  }
  /**
   * Called when the networking instance for this connection closes. If the close code is 4014 (do not reconnect),
   * the voice connection will transition to the Disconnected state which will store the close code. You can
   * decide whether or not to reconnect when this occurs by listening for the state change and calling reconnect().
   *
   * @remarks
   * If the close code was anything other than 4014, it is likely that the closing was not intended, and so the
   * VoiceConnection will signal to Discord that it would like to rejoin the channel. This automatically attempts
   * to re-establish the connection. This would be seen as a transition from the Ready state to the Signalling state.
   * @param code - The close code
   */
  onNetworkingClose(code) {
    if (this.state.status === "destroyed" /* Destroyed */)
      return;
    if (code === 4014) {
      this.state = {
        ...this.state,
        status: "disconnected" /* Disconnected */,
        reason: 0 /* WebSocketClose */,
        closeCode: code
      };
    } else {
      this.state = {
        ...this.state,
        status: "signalling" /* Signalling */
      };
      this.rejoinAttempts++;
      if (!this.state.adapter.sendPayload(createJoinVoiceChannelPayload(this.joinConfig))) {
        this.state = {
          ...this.state,
          status: "disconnected" /* Disconnected */,
          reason: 1 /* AdapterUnavailable */
        };
      }
    }
  }
  /**
   * Called when the state of the networking instance changes. This is used to derive the state of the voice connection.
   *
   * @param oldState - The previous state
   * @param newState - The new state
   */
  onNetworkingStateChange(oldState, newState) {
    this.updateReceiveBindings(newState, oldState);
    if (oldState.code === newState.code)
      return;
    if (this.state.status !== "connecting" /* Connecting */ && this.state.status !== "ready" /* Ready */)
      return;
    if (newState.code === 4 /* Ready */) {
      this.state = {
        ...this.state,
        status: "ready" /* Ready */
      };
    } else if (newState.code !== 6 /* Closed */) {
      this.state = {
        ...this.state,
        status: "connecting" /* Connecting */
      };
    }
  }
  /**
   * Propagates errors from the underlying network instance.
   *
   * @param error - The error to propagate
   */
  onNetworkingError(error) {
    this.emit("error", error);
  }
  /**
   * Propagates debug messages from the underlying network instance.
   *
   * @param message - The debug message to propagate
   */
  onNetworkingDebug(message) {
    this.debug?.(`[NW] ${message}`);
  }
  /**
   * Prepares an audio packet for dispatch.
   *
   * @param buffer - The Opus packet to prepare
   */
  prepareAudioPacket(buffer) {
    const state = this.state;
    if (state.status !== "ready" /* Ready */)
      return;
    return state.networking.prepareAudioPacket(buffer);
  }
  /**
   * Dispatches the previously prepared audio packet (if any)
   */
  dispatchAudio() {
    const state = this.state;
    if (state.status !== "ready" /* Ready */)
      return;
    return state.networking.dispatchAudio();
  }
  /**
   * Prepares an audio packet and dispatches it immediately.
   *
   * @param buffer - The Opus packet to play
   */
  playOpusPacket(buffer) {
    const state = this.state;
    if (state.status !== "ready" /* Ready */)
      return;
    state.networking.prepareAudioPacket(buffer);
    return state.networking.dispatchAudio();
  }
  /**
   * Destroys the VoiceConnection, preventing it from connecting to voice again.
   * This method should be called when you no longer require the VoiceConnection to
   * prevent memory leaks.
   *
   * @param adapterAvailable - Whether the adapter can be used
   */
  destroy(adapterAvailable = true) {
    if (this.state.status === "destroyed" /* Destroyed */) {
      throw new Error("Cannot destroy VoiceConnection - it has already been destroyed");
    }
    if (getVoiceConnection(this.joinConfig.guildId, this.joinConfig.group) === this) {
      untrackVoiceConnection(this);
    }
    if (adapterAvailable) {
      this.state.adapter.sendPayload(createJoinVoiceChannelPayload({ ...this.joinConfig, channelId: null }));
    }
    this.state = {
      status: "destroyed" /* Destroyed */
    };
  }
  /**
   * Disconnects the VoiceConnection, allowing the possibility of rejoining later on.
   *
   * @returns `true` if the connection was successfully disconnected
   */
  disconnect() {
    if (this.state.status === "destroyed" /* Destroyed */ || this.state.status === "signalling" /* Signalling */) {
      return false;
    }
    this.joinConfig.channelId = null;
    if (!this.state.adapter.sendPayload(createJoinVoiceChannelPayload(this.joinConfig))) {
      this.state = {
        adapter: this.state.adapter,
        subscription: this.state.subscription,
        status: "disconnected" /* Disconnected */,
        reason: 1 /* AdapterUnavailable */
      };
      return false;
    }
    this.state = {
      adapter: this.state.adapter,
      reason: 3 /* Manual */,
      status: "disconnected" /* Disconnected */
    };
    return true;
  }
  /**
   * Attempts to rejoin (better explanation soon:tm:)
   *
   * @remarks
   * Calling this method successfully will automatically increment the `rejoinAttempts` counter,
   * which you can use to inform whether or not you'd like to keep attempting to reconnect your
   * voice connection.
   *
   * A state transition from Disconnected to Signalling will be observed when this is called.
   */
  rejoin(joinConfig) {
    if (this.state.status === "destroyed" /* Destroyed */) {
      return false;
    }
    const notReady = this.state.status !== "ready" /* Ready */;
    if (notReady)
      this.rejoinAttempts++;
    Object.assign(this.joinConfig, joinConfig);
    if (this.state.adapter.sendPayload(createJoinVoiceChannelPayload(this.joinConfig))) {
      if (notReady) {
        this.state = {
          ...this.state,
          status: "signalling" /* Signalling */
        };
      }
      return true;
    }
    this.state = {
      adapter: this.state.adapter,
      subscription: this.state.subscription,
      status: "disconnected" /* Disconnected */,
      reason: 1 /* AdapterUnavailable */
    };
    return false;
  }
  /**
   * Updates the speaking status of the voice connection. This is used when audio players are done playing audio,
   * and need to signal that the connection is no longer playing audio.
   *
   * @param enabled - Whether or not to show as speaking
   */
  setSpeaking(enabled) {
    if (this.state.status !== "ready" /* Ready */)
      return false;
    return this.state.networking.setSpeaking(enabled);
  }
  /**
   * Subscribes to an audio player, allowing the player to play audio on this voice connection.
   *
   * @param player - The audio player to subscribe to
   * @returns The created subscription
   */
  subscribe(player) {
    if (this.state.status === "destroyed" /* Destroyed */)
      return;
    const subscription = player["subscribe"](this);
    this.state = {
      ...this.state,
      subscription
    };
    return subscription;
  }
  /**
   * The latest ping (in milliseconds) for the WebSocket connection and audio playback for this voice
   * connection, if this data is available.
   *
   * @remarks
   * For this data to be available, the VoiceConnection must be in the Ready state, and its underlying
   * WebSocket connection and UDP socket must have had at least one ping-pong exchange.
   */
  get ping() {
    if (this.state.status === "ready" /* Ready */ && this.state.networking.state.code === 4 /* Ready */) {
      return {
        ws: this.state.networking.state.ws.ping,
        udp: this.state.networking.state.udp.ping
      };
    }
    return {
      ws: void 0,
      udp: void 0
    };
  }
  /**
   * Called when a subscription of this voice connection to an audio player is removed.
   *
   * @param subscription - The removed subscription
   */
  onSubscriptionRemoved(subscription) {
    if (this.state.status !== "destroyed" /* Destroyed */ && this.state.subscription === subscription) {
      this.state = {
        ...this.state,
        subscription: void 0
      };
    }
  }
};
function createVoiceConnection(joinConfig, options) {
  const payload = createJoinVoiceChannelPayload(joinConfig);
  const existing = getVoiceConnection(joinConfig.guildId, joinConfig.group);
  if (existing && existing.state.status !== "destroyed" /* Destroyed */) {
    if (existing.state.status === "disconnected" /* Disconnected */) {
      existing.rejoin({
        channelId: joinConfig.channelId,
        selfDeaf: joinConfig.selfDeaf,
        selfMute: joinConfig.selfMute
      });
    } else if (!existing.state.adapter.sendPayload(payload)) {
      existing.state = {
        ...existing.state,
        status: "disconnected" /* Disconnected */,
        reason: 1 /* AdapterUnavailable */
      };
    }
    return existing;
  }
  const voiceConnection = new VoiceConnection(joinConfig, options);
  trackVoiceConnection(voiceConnection);
  if (voiceConnection.state.status !== "destroyed" /* Destroyed */ && !voiceConnection.state.adapter.sendPayload(payload)) {
    voiceConnection.state = {
      ...voiceConnection.state,
      status: "disconnected" /* Disconnected */,
      reason: 1 /* AdapterUnavailable */
    };
  }
  return voiceConnection;
}
__name(createVoiceConnection, "createVoiceConnection");

// src/joinVoiceChannel.ts
function joinVoiceChannel(options) {
  const joinConfig = {
    selfDeaf: true,
    selfMute: false,
    group: "default",
    ...options
  };
  return createVoiceConnection(joinConfig, {
    adapterCreator: options.adapterCreator,
    debug: options.debug
  });
}
__name(joinVoiceChannel, "joinVoiceChannel");

// src/audio/AudioResource.ts
import { pipeline } from "node:stream";
import prism2 from "prism-media";

// src/audio/TransformerGraph.ts
import prism from "prism-media";
var FFMPEG_PCM_ARGUMENTS = ["-analyzeduration", "0", "-loglevel", "0", "-f", "s16le", "-ar", "48000", "-ac", "2"];
var FFMPEG_OPUS_ARGUMENTS = [
  "-analyzeduration",
  "0",
  "-loglevel",
  "0",
  "-acodec",
  "libopus",
  "-f",
  "opus",
  "-ar",
  "48000",
  "-ac",
  "2"
];
var StreamType = /* @__PURE__ */ ((StreamType2) => {
  StreamType2["Arbitrary"] = "arbitrary";
  StreamType2["OggOpus"] = "ogg/opus";
  StreamType2["Opus"] = "opus";
  StreamType2["Raw"] = "raw";
  StreamType2["WebmOpus"] = "webm/opus";
  return StreamType2;
})(StreamType || {});
var Node = class {
  static {
    __name(this, "Node");
  }
  /**
   * The outbound edges from this node.
   */
  edges = [];
  /**
   * The type of stream for this node.
   */
  type;
  constructor(type) {
    this.type = type;
  }
  /**
   * Creates an outbound edge from this node.
   *
   * @param edge - The edge to create
   */
  addEdge(edge) {
    this.edges.push({ ...edge, from: this });
  }
};
var NODES = null;
function getNode(type) {
  const node = (NODES ??= initializeNodes()).get(type);
  if (!node)
    throw new Error(`Node type '${type}' does not exist!`);
  return node;
}
__name(getNode, "getNode");
function canEnableFFmpegOptimizations() {
  try {
    return prism.FFmpeg.getInfo().output.includes("--enable-libopus");
  } catch {
  }
  return false;
}
__name(canEnableFFmpegOptimizations, "canEnableFFmpegOptimizations");
function initializeNodes() {
  const nodes = /* @__PURE__ */ new Map();
  for (const streamType of Object.values(StreamType)) {
    nodes.set(streamType, new Node(streamType));
  }
  nodes.get("raw" /* Raw */).addEdge({
    type: "opus encoder" /* OpusEncoder */,
    to: nodes.get("opus" /* Opus */),
    cost: 1.5,
    transformer: () => new prism.opus.Encoder({ rate: 48e3, channels: 2, frameSize: 960 })
  });
  nodes.get("opus" /* Opus */).addEdge({
    type: "opus decoder" /* OpusDecoder */,
    to: nodes.get("raw" /* Raw */),
    cost: 1.5,
    transformer: () => new prism.opus.Decoder({ rate: 48e3, channels: 2, frameSize: 960 })
  });
  nodes.get("ogg/opus" /* OggOpus */).addEdge({
    type: "ogg/opus demuxer" /* OggOpusDemuxer */,
    to: nodes.get("opus" /* Opus */),
    cost: 1,
    transformer: () => new prism.opus.OggDemuxer()
  });
  nodes.get("webm/opus" /* WebmOpus */).addEdge({
    type: "webm/opus demuxer" /* WebmOpusDemuxer */,
    to: nodes.get("opus" /* Opus */),
    cost: 1,
    transformer: () => new prism.opus.WebmDemuxer()
  });
  const FFMPEG_PCM_EDGE = {
    type: "ffmpeg pcm" /* FFmpegPCM */,
    to: nodes.get("raw" /* Raw */),
    cost: 2,
    transformer: (input) => new prism.FFmpeg({
      args: ["-i", typeof input === "string" ? input : "-", ...FFMPEG_PCM_ARGUMENTS]
    })
  };
  nodes.get("arbitrary" /* Arbitrary */).addEdge(FFMPEG_PCM_EDGE);
  nodes.get("ogg/opus" /* OggOpus */).addEdge(FFMPEG_PCM_EDGE);
  nodes.get("webm/opus" /* WebmOpus */).addEdge(FFMPEG_PCM_EDGE);
  nodes.get("raw" /* Raw */).addEdge({
    type: "volume transformer" /* InlineVolume */,
    to: nodes.get("raw" /* Raw */),
    cost: 0.5,
    transformer: () => new prism.VolumeTransformer({ type: "s16le" })
  });
  if (canEnableFFmpegOptimizations()) {
    const FFMPEG_OGG_EDGE = {
      type: "ffmpeg ogg" /* FFmpegOgg */,
      to: nodes.get("ogg/opus" /* OggOpus */),
      cost: 2,
      transformer: (input) => new prism.FFmpeg({
        args: ["-i", typeof input === "string" ? input : "-", ...FFMPEG_OPUS_ARGUMENTS]
      })
    };
    nodes.get("arbitrary" /* Arbitrary */).addEdge(FFMPEG_OGG_EDGE);
    nodes.get("ogg/opus" /* OggOpus */).addEdge(FFMPEG_OGG_EDGE);
    nodes.get("webm/opus" /* WebmOpus */).addEdge(FFMPEG_OGG_EDGE);
  }
  return nodes;
}
__name(initializeNodes, "initializeNodes");
function findPath(from, constraints, goal = getNode("opus" /* Opus */), path = [], depth = 5) {
  if (from === goal && constraints(path)) {
    return { cost: 0 };
  } else if (depth === 0) {
    return { cost: Number.POSITIVE_INFINITY };
  }
  let currentBest;
  for (const edge of from.edges) {
    if (currentBest && edge.cost > currentBest.cost)
      continue;
    const next = findPath(edge.to, constraints, goal, [...path, edge], depth - 1);
    const cost = edge.cost + next.cost;
    if (!currentBest || cost < currentBest.cost) {
      currentBest = { cost, edge, next };
    }
  }
  return currentBest ?? { cost: Number.POSITIVE_INFINITY };
}
__name(findPath, "findPath");
function constructPipeline(step) {
  const edges = [];
  let current = step;
  while (current?.edge) {
    edges.push(current.edge);
    current = current.next;
  }
  return edges;
}
__name(constructPipeline, "constructPipeline");
function findPipeline(from, constraint) {
  return constructPipeline(findPath(getNode(from), constraint));
}
__name(findPipeline, "findPipeline");

// src/audio/AudioResource.ts
var AudioResource = class {
  static {
    __name(this, "AudioResource");
  }
  /**
   * An object-mode Readable stream that emits Opus packets. This is what is played by audio players.
   */
  playStream;
  /**
   * The pipeline used to convert the input stream into a playable format. For example, this may
   * contain an FFmpeg component for arbitrary inputs, and it may contain a VolumeTransformer component
   * for resources with inline volume transformation enabled.
   */
  edges;
  /**
   * Optional metadata that can be used to identify the resource.
   */
  metadata;
  /**
   * If the resource was created with inline volume transformation enabled, then this will be a
   * prism-media VolumeTransformer. You can use this to alter the volume of the stream.
   */
  volume;
  /**
   * If using an Opus encoder to create this audio resource, then this will be a prism-media opus.Encoder.
   * You can use this to control settings such as bitrate, FEC, PLP.
   */
  encoder;
  /**
   * The audio player that the resource is subscribed to, if any.
   */
  audioPlayer;
  /**
   * The playback duration of this audio resource, given in milliseconds.
   */
  playbackDuration = 0;
  /**
   * Whether or not the stream for this resource has started (data has become readable)
   */
  started = false;
  /**
   * The number of silence frames to append to the end of the resource's audio stream, to prevent interpolation glitches.
   */
  silencePaddingFrames;
  /**
   * The number of remaining silence frames to play. If -1, the frames have not yet started playing.
   */
  silenceRemaining = -1;
  constructor(edges, streams, metadata, silencePaddingFrames) {
    this.edges = edges;
    this.playStream = streams.length > 1 ? pipeline(streams, noop) : streams[0];
    this.metadata = metadata;
    this.silencePaddingFrames = silencePaddingFrames;
    for (const stream of streams) {
      if (stream instanceof prism2.VolumeTransformer) {
        this.volume = stream;
      } else if (stream instanceof prism2.opus.Encoder) {
        this.encoder = stream;
      }
    }
    this.playStream.once("readable", () => this.started = true);
  }
  /**
   * Whether this resource is readable. If the underlying resource is no longer readable, this will still return true
   * while there are silence padding frames left to play.
   */
  get readable() {
    if (this.silenceRemaining === 0)
      return false;
    const real = this.playStream.readable;
    if (!real) {
      if (this.silenceRemaining === -1)
        this.silenceRemaining = this.silencePaddingFrames;
      return this.silenceRemaining !== 0;
    }
    return real;
  }
  /**
   * Whether this resource has ended or not.
   */
  get ended() {
    return this.playStream.readableEnded || this.playStream.destroyed || this.silenceRemaining === 0;
  }
  /**
   * Attempts to read an Opus packet from the audio resource. If a packet is available, the playbackDuration
   * is incremented.
   *
   * @remarks
   * It is advisable to check that the playStream is readable before calling this method. While no runtime
   * errors will be thrown, you should check that the resource is still available before attempting to
   * read from it.
   * @internal
   */
  read() {
    if (this.silenceRemaining === 0) {
      return null;
    } else if (this.silenceRemaining > 0) {
      this.silenceRemaining--;
      return SILENCE_FRAME;
    }
    const packet = this.playStream.read();
    if (packet) {
      this.playbackDuration += 20;
    }
    return packet;
  }
};
var VOLUME_CONSTRAINT = /* @__PURE__ */ __name((path) => path.some((edge) => edge.type === "volume transformer" /* InlineVolume */), "VOLUME_CONSTRAINT");
var NO_CONSTRAINT = /* @__PURE__ */ __name(() => true, "NO_CONSTRAINT");
function inferStreamType(stream) {
  if (stream instanceof prism2.opus.Encoder) {
    return { streamType: "opus" /* Opus */, hasVolume: false };
  } else if (stream instanceof prism2.opus.Decoder) {
    return { streamType: "raw" /* Raw */, hasVolume: false };
  } else if (stream instanceof prism2.VolumeTransformer) {
    return { streamType: "raw" /* Raw */, hasVolume: true };
  } else if (stream instanceof prism2.opus.OggDemuxer) {
    return { streamType: "opus" /* Opus */, hasVolume: false };
  } else if (stream instanceof prism2.opus.WebmDemuxer) {
    return { streamType: "opus" /* Opus */, hasVolume: false };
  }
  return { streamType: "arbitrary" /* Arbitrary */, hasVolume: false };
}
__name(inferStreamType, "inferStreamType");
function createAudioResource(input, options = {}) {
  let inputType = options.inputType;
  let needsInlineVolume = Boolean(options.inlineVolume);
  if (typeof input === "string") {
    inputType = "arbitrary" /* Arbitrary */;
  } else if (inputType === void 0) {
    const analysis = inferStreamType(input);
    inputType = analysis.streamType;
    needsInlineVolume = needsInlineVolume && !analysis.hasVolume;
  }
  const transformerPipeline = findPipeline(inputType, needsInlineVolume ? VOLUME_CONSTRAINT : NO_CONSTRAINT);
  if (transformerPipeline.length === 0) {
    if (typeof input === "string")
      throw new Error(`Invalid pipeline constructed for string resource '${input}'`);
    return new AudioResource(
      [],
      [input],
      options.metadata ?? null,
      options.silencePaddingFrames ?? 5
    );
  }
  const streams = transformerPipeline.map((edge) => edge.transformer(input));
  if (typeof input !== "string")
    streams.unshift(input);
  return new AudioResource(
    transformerPipeline,
    streams,
    options.metadata ?? null,
    options.silencePaddingFrames ?? 5
  );
}
__name(createAudioResource, "createAudioResource");

// src/util/generateDependencyReport.ts
import { resolve, dirname } from "node:path";
import prism3 from "prism-media";
function findPackageJSON(dir, packageName, depth) {
  if (depth === 0)
    return void 0;
  const attemptedPath = resolve(dir, "./package.json");
  try {
    const pkg = __require(attemptedPath);
    if (pkg.name !== packageName)
      throw new Error("package.json does not match");
    return pkg;
  } catch {
    return findPackageJSON(resolve(dir, ".."), packageName, depth - 1);
  }
}
__name(findPackageJSON, "findPackageJSON");
function version(name) {
  try {
    if (name === "@discordjs/voice") {
      return "0.17.0";
    }
    const pkg = findPackageJSON(dirname(__require.resolve(name)), name, 3);
    return pkg?.version ?? "not found";
  } catch {
    return "not found";
  }
}
__name(version, "version");
function generateDependencyReport() {
  const report = [];
  const addVersion = /* @__PURE__ */ __name((name) => report.push(`- ${name}: ${version(name)}`), "addVersion");
  report.push("Core Dependencies");
  addVersion("@discordjs/voice");
  addVersion("prism-media");
  report.push("");
  report.push("Opus Libraries");
  addVersion("@discordjs/opus");
  addVersion("opusscript");
  report.push("");
  report.push("Encryption Libraries");
  addVersion("sodium-native");
  addVersion("sodium");
  addVersion("libsodium-wrappers");
  addVersion("tweetnacl");
  report.push("");
  report.push("FFmpeg");
  try {
    const info = prism3.FFmpeg.getInfo();
    report.push(`- version: ${info.version}`);
    report.push(`- libopus: ${info.output.includes("--enable-libopus") ? "yes" : "no"}`);
  } catch {
    report.push("- not found");
  }
  return ["-".repeat(50), ...report, "-".repeat(50)].join("\n");
}
__name(generateDependencyReport, "generateDependencyReport");

// src/util/entersState.ts
import { once } from "node:events";

// src/util/abortAfter.ts
function abortAfter(delay) {
  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), delay);
  ac.signal.addEventListener("abort", () => clearTimeout(timeout));
  return [ac, ac.signal];
}
__name(abortAfter, "abortAfter");

// src/util/entersState.ts
async function entersState(target, status, timeoutOrSignal) {
  if (target.state.status !== status) {
    const [ac, signal] = typeof timeoutOrSignal === "number" ? abortAfter(timeoutOrSignal) : [void 0, timeoutOrSignal];
    try {
      await once(target, status, { signal });
    } finally {
      ac?.abort();
    }
  }
  return target;
}
__name(entersState, "entersState");

// src/util/demuxProbe.ts
import { Buffer as Buffer7 } from "node:buffer";
import process from "node:process";
import { Readable as Readable2 } from "node:stream";
import prism4 from "prism-media";
function validateDiscordOpusHead(opusHead) {
  const channels = opusHead.readUInt8(9);
  const sampleRate = opusHead.readUInt32LE(12);
  return channels === 2 && sampleRate === 48e3;
}
__name(validateDiscordOpusHead, "validateDiscordOpusHead");
async function demuxProbe(stream, probeSize = 1024, validator = validateDiscordOpusHead) {
  return new Promise((resolve2, reject) => {
    if (stream.readableObjectMode) {
      reject(new Error("Cannot probe a readable stream in object mode"));
      return;
    }
    if (stream.readableEnded) {
      reject(new Error("Cannot probe a stream that has ended"));
      return;
    }
    let readBuffer = Buffer7.alloc(0);
    let resolved;
    const finish = /* @__PURE__ */ __name((type) => {
      stream.off("data", onData);
      stream.off("close", onClose);
      stream.off("end", onClose);
      stream.pause();
      resolved = type;
      if (stream.readableEnded) {
        resolve2({
          stream: Readable2.from(readBuffer),
          type
        });
      } else {
        if (readBuffer.length > 0) {
          stream.push(readBuffer);
        }
        resolve2({
          stream,
          type
        });
      }
    }, "finish");
    const foundHead = /* @__PURE__ */ __name((type) => (head) => {
      if (validator(head)) {
        finish(type);
      }
    }, "foundHead");
    const webm = new prism4.opus.WebmDemuxer();
    webm.once("error", noop);
    webm.on("head", foundHead("webm/opus" /* WebmOpus */));
    const ogg = new prism4.opus.OggDemuxer();
    ogg.once("error", noop);
    ogg.on("head", foundHead("ogg/opus" /* OggOpus */));
    const onClose = /* @__PURE__ */ __name(() => {
      if (!resolved) {
        finish("arbitrary" /* Arbitrary */);
      }
    }, "onClose");
    const onData = /* @__PURE__ */ __name((buffer) => {
      readBuffer = Buffer7.concat([readBuffer, buffer]);
      webm.write(buffer);
      ogg.write(buffer);
      if (readBuffer.length >= probeSize) {
        stream.off("data", onData);
        stream.pause();
        process.nextTick(onClose);
      }
    }, "onData");
    stream.once("error", reject);
    stream.on("data", onData);
    stream.once("close", onClose);
    stream.once("end", onClose);
  });
}
__name(demuxProbe, "demuxProbe");

// src/index.ts
var version2 = "0.17.0";
export {
  AudioPlayer,
  AudioPlayerError,
  AudioPlayerStatus,
  AudioReceiveStream,
  AudioResource,
  EndBehaviorType,
  NoSubscriberBehavior,
  PlayerSubscription,
  SSRCMap,
  SpeakingMap,
  StreamType,
  VoiceConnection,
  VoiceConnectionDisconnectReason,
  VoiceConnectionStatus,
  VoiceReceiver,
  createAudioPlayer,
  createAudioResource,
  createDefaultAudioReceiveStreamOptions,
  demuxProbe,
  entersState,
  generateDependencyReport,
  getGroups,
  getVoiceConnection,
  getVoiceConnections,
  joinVoiceChannel,
  validateDiscordOpusHead,
  version2 as version
};
//# sourceMappingURL=index.mjs.map