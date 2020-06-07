class AbbePierre extends Plugin {
  name = 'abbePierre';

  onWrite(data, nick) {
    return this.talkBot(data.payload, true, nick);
  }

  talkBot(msg, tags, nick) {
    if (
      msg.charAt(0) != '/' &&
      msg.indexOf('plugin') === -1 &&
      (!tags || (tags && nick))
    ) {
      if (
        msg.indexOf('la bai') > -1 ||
        msg.indexOf('la bé') > -1 ||
        msg.indexOf('la bei') > -1 ||
        msg.indexOf("l'abai") > -1 ||
        msg.indexOf("l'abé") > -1 ||
        msg.indexOf("l'abei") > -1
      )
        setTimeout(function () {
          $.chat.write("Parce que l'abbé Pierre est mort!", 'qrthur');
        }, 500);
    }

    return msg;
  }
}

$.registerPlugin(AbbePierre, 2);
