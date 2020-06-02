class Plugin {
  start() {}

  stop() {}

  onEvent(eventName, event) {
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

  onSend(msg) {
    return msg;
  }

  onReceived(msg, nick) {
    return msg;
  }

  onWrite(msg, nick) {
    return msg;
  }

  onNewUser(nick) {}

  onUsersRefresh(listTag) {}
}
