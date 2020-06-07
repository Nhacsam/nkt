class V1PluginAdapter extends Plugin {
  constructor(plugin) {
    super();
    this.name = plugin.name;

    this.plugin = {
      onSend: (msg) => msg,
      onReceived: (msg) => msg,
      onWrite: (msg) => msg,
      onNewUser: () => {},
      onUsersRefresh: () => {},
      init: () => {},
      stop: () => {},
      ...plugin,
    };
  }

  init() {
    this.plugin.init();
  }

  stop() {
    this.plugin.stop();
  }

  onMessageReceived(msg, nick) {
    this.plugin.onReceived(msg, nick);
  }

  onWrite(data, nick) {
    this.plugin.onWrite(data.payload, nick);
  }

  onNewUser(nick) {
    this.plugin.onNewUser(nick);
  }

  onUsersRefresh(list) {
    this.plugin.onUsersRefresh(list);
  }
}
