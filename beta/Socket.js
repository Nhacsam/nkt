/*
 * NKT Socket protocol v2
 */
class Socket {
  constructor(eventEmitter, userList) {
    this.eventEmitter = eventEmitter;
    this.userList = userList;

    this.nickName = null;

    setTimeout(() => this.eventEmitter.emit('ready'), 500);
    setInterval(() => this.ping(), 5000);

    window.addEventListener('nktencryptedmessagereceived', (event) => {
      this.onSocketReceive(event.detail);
    });
    window.addEventListener('nktclearmessagereceived', (event) => {
      this.onSocketReceive(event.detail);
    });
  }

  sendMessage(message) {
    this.sendData({
      plugin: null,
      type: 'message',
      payload: message,
    });
  }

  async sendData(data) {
    if (!data) {
      return;
    }
    this.eventEmitter.emit('send', data);
    if (!data.payload || data.type === 'omit') {
      return;
    }
    window.nkt.sendEncryptedMessage({
      nickSrc: btoa(this.nickName),
      ...data,
    });
    this.onReceiveData(data, this.nickName);
  }

  async sendPrivateData(data, user) {
    window.nkt.sendEncryptedMessage(
      {
        nickSrc: btoa(this.nickName),
        ...data,
        private: true,
      },
      user.id
    );
    this.onReceiveData(data, this.nickName);
  }

  async onSocketReceive(sock) {
    const { message, from } = sock;
    if (typeof message !== 'object' || !message.nickSrc) {
      console.warn('Invalid socket received', message);
      return;
    }

    const nickName = atob(message.nickSrc);
    const user = this.userList.saveUser(from, nickName);

    if (!this.nickName || (user && user.isMuted) || message.ping) {
      return;
    }
    this.onReceiveData(message, nickName);
    this.ping();
  }

  onReceiveData(data, nickName) {
    data.nickName = nickName;
    if (data.plaintext) {
      //compatibility v1
      data.plugin = null;
      data.type = 'message';
      data.payload = data.plaintext;
    }

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
    if (!this.nickName) {
      return;
    }

    window.nkt.sendClearMessage({
      ping: true,
      nickSrc: btoa(this.nickName),
      type: 'ping',
    });
    this.eventEmitter.emit('ping');
  }

  setNickname(nickName) {
    this.nickName = nickName;
  }
}
