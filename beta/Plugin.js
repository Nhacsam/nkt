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
        return this.onReceived(event.data.payload, event.nickName);
      case 'write':
        return this.onWrite(event.data.payload, event.nickName);
      case 'newUser':
        this.onNewUser(event);
    }
  }

  onSend(msg) {}

  onReceived(msg, nick) {}

  onWrite(msg, nick) {}

  onNewUser(nick) {}

  onUsersRefresh(listTag) {}
}
