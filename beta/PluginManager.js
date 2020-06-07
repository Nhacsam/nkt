class PluginManager {
  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter;

    this.plugins = {};
    this.activePlugins = ['abbePierre'];

    eventEmitter.subscribe((event, data) => this.onEvent(event, data));
  }

  addPlugin(PluginConstructor, version) {
    if (version === 1) {
      return this.registerV1Plugin(PluginConstructor);
    }
    if (typeof PluginConstructor !== 'function') {
      return;
    }
    const plugin = new PluginConstructor();
    this.addPluginInstance(plugin);
  }

  addPluginInstance(plugin) {
    if (!plugin.name) {
      console.error('New plugin added without a name');
      return;
    }

    this.plugins[plugin.name] = plugin;
    this.eventEmitter.emit('newPlugin', plugin);
    this.eventEmitter.emit('pluginListChanged', this.getListChangedEvent());

    if (this.activePlugins.includes(plugin.name)) {
      this.loadPlugin(plugin.name);
    }
  }

  loadPlugin(name) {
    const plugin = this.plugins[name];
    if (!plugin) {
      // @TODO load js
      console.warn('Plugin not found');
      return;
    }

    plugin.start();
    this.activePlugins.push(name);
    this.eventEmitter.emit('pluginLoaded', plugin);
  }

  unloadPlugin(name) {
    const plugin = this.plugins[name];
    if (!plugin) {
      return;
    }

    plugin.stop();
    this.activePlugins = this.activePlugins.filter((p) => p !== name);
    this.eventEmitter.emit('pluginListChanged', this.getListChangedEvent());
    this.eventEmitter.emit('pluginUnloaded', plugin);
  }

  togglePlugin(name) {
    if (this.activePlugins.includes(name)) {
      this.unloadPlugin(name);
    } else {
      this.loadPlugin(name);
    }
  }

  onEvent(event, data) {
    if (event === 'togglePlugin') {
      this.togglePlugin(data);
    }
    Object.keys(this.plugins).forEach((name) => {
      const plugin = this.plugins[name];
      plugin.onEvent(event, data);
    });
  }

  getListChangedEvent() {
    return Object.keys(this.plugins).map((name) => ({
      name,
      active: this.activePlugins.includes(name),
      plugin: this.plugins[name],
    }));
  }

  registerV1Plugin(plugin) {
    console.log('register v1');
    if (! plugin) {
      return;
    }
    const { name } = plugin;
    if (! name || this.plugins[name]) {
      return;
    }
    this.addPluginInstance(new V1PluginAdapter(plugin));
  }
}
