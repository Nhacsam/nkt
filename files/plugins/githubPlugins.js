$.plugin({
    name: 'githubPlugins',
    init: function() {
      window.removeEventListener("message", $.chat.githubPluginsListener);
      $.chat.githubPluginsListener = this.receiveMessage;
      window.addEventListener("message", $.chat.githubPluginsListener, false);
      if (!document.getElementById('githubPluginsFrame')) {
        $('#plugin-container').prepend('<iframe id="githubPluginsFrame" style="border:0;height:50px;width:200px" src="https://fabiendaou.github.io/index.html"></iframe>');
      }
    },
    stop: function() {
      window.removeEventListener("message", $.chat.githubPluginsListener);
      $.chat.githubPluginsListener = null;
      $('#githubPluginsFrame').remove();
    },
    receiveMessage(event) {
      if (event.origin !== "https://fabiendaou.github.io")
        return;
      try {
        const eventData = JSON.parse(event.data);
        console.log(eventData);
        switch (eventData.event) {
          case 'pluginsLoaded':
            for (let plugin of eventData.data) {
                //console.log(plugin);
                try {
                    try {
                        // JSON ?
                        if (plugin.text.charAt(0) === '{') {
                            console.log('plugin ' + plugin.name + ' is json');
                            let json = JSON.parse(plugin.text);
                            console.log('JSON of plugin ' + plugin.name + ' parsed ok');
                            plugin.text = atob(json.content);
                        }
                    } catch(e) {
                        console.log('error in json parsing or atobing plugin ' + plugin.name);
                        console.error(e);// Raw
                    } finally {
                        eval(plugin.text);
                    }
                } catch (e) { console.error(e); }
                
            }
            break;
          default:
            //console.log('Cannot understand message from iframe');
            //console.log(eventData);
        }
      } catch(e) {console.error(e);}
    }
});