$.plugin({
  name: 'abbePierre',

  onWrite: function (msg, nick) {
    return this.TalkBot(msg, true, nick);
  },

  TalkBot: function (msg, tags, nick) {
    if (
      msg.charAt(0) != '/' &&
      msg.indexOf('plugin') === -1 &&
      (!tags || (tags && nick))
    ) {
      if (
        msg.indexOf('la bai') > -1 ||
        msg.indexOf('la bÃ©') > -1 ||
        msg.indexOf('la bei') > -1 ||
        msg.indexOf("l'abai") > -1 ||
        msg.indexOf("l'abÃ©") > -1 ||
        msg.indexOf("l'abei") > -1
      )
        setTimeout(function () {
          $.chat.write("Parce que l'abbÃ© Pierre est mort!", 'qrthur');
        }, 500);
    }

    return msg;
  },
});
