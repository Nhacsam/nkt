const __temp_plugin_list = [];

jQuery.registerPlugin = (plugin, version) => {
  __temp_plugin_list.push({ plugin, version });
};

(function ($) {
  $(document).ready(function () {
    const eventEmitter = new EventEmitter();
    const userList = new UserList(eventEmitter);
    const sock = new Socket(eventEmitter, userList);
    const layout = new Layout(eventEmitter, sock, userList);
    const pluginManager = new PluginManager(eventEmitter);
    $.socket = sock;

    $.registerPlugin = (plugin, version) =>
      pluginManager.addPlugin(plugin, version);

    __temp_plugin_list.forEach(({ plugin, version }) => {
      pluginManager.addPlugin(plugin, version);
    });

    $.chat = {
      write: layout.writeMessage.bind(layout),
    };
  });
})(jQuery);
