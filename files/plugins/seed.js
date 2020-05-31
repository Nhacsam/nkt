$.plugin({
  name: 'seed',
  init: function () {
    var plugins = [];

    var loadPluginsWhenNotLooking = function (plugins) {
      if (plugins.length !== 0) {
        $.pluginApi.loadPlugin(plugins.shift());
        setTimeout(() => {
          if (!looking) {
            loadPluginsWhenNotLooking(plugins);
          }
        }, 10);
      }
    };
    var looking;
    $(window).focus(function () {
      looking = true;
    });
    $(window).blur(function () {
      looking = false;
      loadPluginsWhenNotLooking(plugins);
    });
  },
});
