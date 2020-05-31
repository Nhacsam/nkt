/*
 * NKT Socket protocol v2
 */
class Socket {
  constructor(eventEmitter, userList) {
    this.pubKey;
    this.nickName;
    this.privateKey;
    this.eventEmitter = eventEmitter;
    this.socket = null;

    this.userList = userList;

    Promise.all([this.initializeCrypto(), this.socketConnect()]).then(() => {
      this.eventEmitter.emit('ready');
      this.socket.on('nktp2', (data) => this.onSocketReceive(data));
      setInterval(() => this.ping(), 500);
    });
  }

  initializeCrypto() {
    return new Promise((success) => {
      setTimeout(() => {
        this.privateKey = cryptico.generateRSAKey(
          Math.random().toString(),
          2048
        );
        this.pubKey = cryptico.publicKeyString(this.privateKey);
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

  sendData(data) {
    if (!data || !this.socket) {
      return;
    }
    this.eventEmitter.emit('send', data);
    if (!data.payload || data.type === 'omit') {
      return;
    }

    const socketData = {
      nickSrc: btoa(this.nickName),
      pubKeySrc: this.pubKey,
    };
    const json = JSON.stringify(data);

    this.userList.getUsers().forEach((user) => {
      const { cipher } = cryptico.encrypt(json, user.publicKey);
      this.socket.emit('nktp2', {
        ...socketData,
        pubKeyDest: user.publicKey,
        data: cipher,
      });
    });

    this.onReceiveData(data, this.nickName);
  }

  sendPrivateData(data, user) {
    if (!this.socket) {
      return;
    }
    const json = JSON.stringify({
      ...data,
      private: true,
    });
    const { cipher } = cryptico.encrypt(json, user.publicKey);
    this.socket.emit('nktp2', {
      nickSrc: btoa(this.nickName),
      pubKeySrc: this.pubKey,
      pubKeyDest: user.publicKey,
      data: cipher,
    });
    this.onReceiveData(data, this.nickName);
  }

  onSocketReceive(sock) {
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

    const nickName = atob(sock.nickSrc);
    const user = this.userList.saveUser(sock.pubKeySrc, nickName);
    if (sock.pubKeyDest !== this.pubKey) {
      return;
    }
    if (user && user.isMuted) {
      return;
    }

    const { plaintext } = cryptico.decrypt(sock.data, this.privateKey);
    this.onReceiveData(JSON.parse(plaintext), nickName);
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
      pubKeySrc: this.pubKey,
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

