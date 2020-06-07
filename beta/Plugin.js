class Plugin {
  constructor() {
    this.active = false;
  }

  start() {
    this.active = true;
  }

  stop() {
    this.active = false;
  }

  onEvent(eventName, event) {
    if (!this.active) {
      return;
    }

    switch (eventName) {
      case 'send':
        return this.onSend(event.payload);
      case 'received':
        if (event.data.type === 'message' && event.data.payload) {
        return this.onMessageReceived(event.data.payload, event.nickName);
        }
        return this.onReceived(event.data, event.nickName);
      case 'write':
        if (! event.data.payload) {
          return;
        }
        return this.onWrite(event.data, event.nickName);
      case 'newUser':
        this.onNewUser(event);
    }
  }

  onSend(msg) {}

  onReceived(data, nick) {}

  onMessageReceived(msg, nick) {}

  onWrite(data, nick) {}

  onNewUser(nick) {}

  onUsersRefresh(listTag) {}
}
