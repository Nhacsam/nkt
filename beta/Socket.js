/*
 * NKT Socket protocol v2
 */
class Socket {
  constructor(eventEmitter, userList) {
    this.privateKey;

    this.nickName = null;
    this.eventEmitter = eventEmitter;
    this.socket = null;

    this.keyPair = null;
    this.exportedKey = null;

    this.userList = userList;

    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder('utf-8');

    Promise.all([this.initializeCrypto(), this.socketConnect()]).then(() => {
      this.eventEmitter.emit('ready');
      this.socket.on('nktp2', (data) => this.onSocketReceive(data));
      setInterval(() => this.ping(), 500);
    });
  }

  initializeCrypto() {
    return new Promise((success) => {
      setTimeout(async () => {
        this.keyPair = await window.crypto.subtle.generateKey(
          {
            name: 'RSA-OAEP',
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
          },
          true,
          ['encrypt', 'decrypt']
        );
        this.exportedKey = await crypto.subtle.exportKey(
          'jwk',
          this.keyPair.publicKey
        );
        success();
      }, 10);
    });
  }

  socketConnect() {
    return $.get('/port').then(({ port }) => {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;

      let host = protocol.replace(/^http/, 'ws') + '//' + hostname;
      if (protocol !== 'http:' && protocol !== 'https:') {
        host = 'ws://' + $(location).attr('hostname');
      }

      if (hostname === 'localhost') {
        host = 'http://' + $(location).attr('hostname') + ':' + port;
      }
      this.socket = io(host);
      return new Promise((success) => this.socket.on('connect', success));
    });
  }

  sendMessage(message) {
    this.sendData({
      plugin: null,
      type: 'message',
      payload: message,
    });
  }

  encodePublicKey(key) {
    return btoa(JSON.stringify(key));
  }

  async sendData(data) {
    if (!data || !this.socket) {
      return;
    }
    this.eventEmitter.emit('send', data);
    if (!data.payload || data.type === 'omit') {
      return;
    }

    const socketData = {
      nickSrc: btoa(this.nickName),
      pubKeySrc: this.exportedKey,
    };
    const json = JSON.stringify(data);

    await Promise.all(
      this.userList.getUsers().map(async (user) => {
        const encrypted = await window.crypto.subtle.encrypt(
          { name: 'RSA-OAEP' },
          user.publicKey,
          this.encoder.encode(json)
        );
        this.socket.emit('nktp2', {
          ...socketData,
          pubKeyDest: user.alias,
          data: encrypted,
        });
      })
    );

    this.onReceiveData(data, this.nickName);
  }

  async sendPrivateData(data, user) {
    if (!this.socket) {
      return;
    }
    const json = JSON.stringify({
      ...data,
      private: true,
    });
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      user.publicKey,
      this.encoder.encode(json)
    );
    this.socket.emit('nktp2', {
      nickSrc: btoa(this.nickName),
      pubKeySrc: this.exportedKey,
      pubKeyDest: user.publicKey,
      data: encrypted,
    });
    this.onReceiveData(data, this.nickName);
  }

  async onSocketReceive(sock) {
    if (
      typeof sock !== 'object' ||
      !sock.pubKeySrc ||
      !sock.nickSrc ||
      !sock.data
    ) {
      console.warn('Invalid socket received', sock);
      return;
    }

    if (!this.nickName) {
      return;
    }

    const publicKey = await window.crypto.subtle.importKey(
      'jwk',
      sock.pubKeySrc,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt']
    );

    const nickName = atob(sock.nickSrc);
    const user = this.userList.saveUser(
      publicKey,
      this.encodePublicKey(sock.pubKeySrc),
      nickName
    );
    if (sock.pubKeyDest !== this.encodePublicKey(this.exportedKey)) {
      return;
    }
    if (user && user.isMuted) {
      return;
    }

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      this.keyPair.privateKey,
      sock.data
    );
    const json = this.decoder.decode(decrypted);
    this.onReceiveData(JSON.parse(json), nickName);
    this.ping();
  }

  onReceiveData(data, nickName) {
    data.nickName = nickName;
    this.eventEmitter.emit('received', {
      nickName,
      data,
    });
    this.eventEmitter.emit('write', {
      nickName,
      data,
    });
  }

  ping() {
    if (!this.socket || !this.nickName) {
      return;
    }
    this.socket.emit('nktp2', {
      nickSrc: btoa(this.nickName),
      pubKeySrc: this.exportedKey,
      data: {
        type: 'ping',
      },
    });
    this.eventEmitter.emit('ping');
  }

  setNickname(nickName) {
    this.nickName = nickName;
  }
}
