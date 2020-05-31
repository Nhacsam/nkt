/**
 * Escape an html string
 * @param string string String to escape
 * @return string Escped string
 */
function escapeHTML(string) {
  var pre = document.createElement('pre');
  var text = document.createTextNode(string);
  pre.appendChild(text);
  return pre.innerHTML;
}

function escapeAndAddWarning(msg) {
  var escaped = escapeHTML(msg);
  var disp = msg;

  if (escaped != msg) {
    disclaimer[unsafe.length] =
      'This message (' + escaped + ') may be unsafe, click to show';
    showHide[unsafe.length] = true;
    disp =
      '<span id="' +
      unsafe.length +
      '" onmouseover="this.style.cursor=\'pointer\';" onclick="$(this).html(showHide[this.id]?\'Unsafe content (click to hide):<br />\'+unsafe[this.id]:disclaimer[this.id]);showHide[this.id]=!showHide[this.id];">' +
      disclaimer[unsafe.length] +
      '</span>';
    unsafe.push(msg);
  }
  return disp;
}

class Layout {
  constructor(eventEmitter, socket, userList) {
    this.eventEmitter = eventEmitter;
    this.socket = socket;
    this.eventEmitter.subscribe(this.onEvent.bind(this));
    this.userList = userList;
  }

  onEvent(event, eData) {
    if (event === 'write') {
      return this.writeMessage(eData.data.payload, eData.nickName);
    }

    if (event === 'ready') {
      return this.onSocketReady();
    }

    if (event == 'userListChanged') {
      return this.updateUserList(eData);
    }
  }

  updateUserList(userList) {
    if (userList.length === 0) {
      $('.connected-list__empty').show();
      $('#connected-list-users').html('');
      return;
    }
    $('.connected-list__empty').hide();

    const userTags = userList.map((user) => {
      const tag = $('<button class="connected-list__user" />');
      tag.text(user.nickName);
      tag.click(() => {
        this.userList.toggleMuteUser(user);
      });
      if (user.isMuted) {
        tag.addClass('connected-list__user--muted');
      }
      return tag;
    });
    $('#connected-list-users').html(userTags);
  }

  onSocketReady() {
    $('#loading-message').hide();
    $('#message-form').hide();
    $('.nickname-field').first().focus();

    $('#nickname-form').submit((e) => this.onSubmitNickname(e));
  }

  onSubmitNickname(e) {
    e.preventDefault();

    const nickName = $('#nickname-field').val();

    $('#nickname-form').hide();
    $('#message-form').show();

    this.socket.setNickname(nickName);
    $('.message-form__label').html(nickName + '&gt;');
    this.setupMessageSending();
  }

  setupMessageSending() {
    $('#message-field').focus();
    $('#message-field').attr('rows', 1);

    $('#message-field')
      .first()
      .keydown(function (e) {
        var code = e.which || e.keyCode || 0;
        if (
          code == 13 ||
          (code == 229 && $('#message-field').val().slice(-1) == '\n')
        ) {
          $('#message-form').submit();
        }
      });
    $('#message-field')
      .first()
      .keydown(function (e) {
        var code = e.which || e.keyCode || 0;
        if (
          code == 13 ||
          (code == 229 && $('#message-field').val().slice(-1) == '\n')
        ) {
          $('#message-form').submit();
        }
      });

    $('#message-form').submit((e) => this.onMessageSubmit(e));
  }

  onMessageSubmit(e) {
    e.preventDefault();
    var msg = $('#message-field').val();
    var data = {};
    msg = $.trim(msg);

    if (!msg) {
      return;
    }
    this.socket.sendMessage(msg);
    $('#message-field').val('').focus();
  }

  /**
   * Write a message on the window
   * @param string msg Message to display
   * @param string nickName Source of the message (nickname)
   * @param bollean notEscape set to true to not escape HTML (optional)
   */
  writeMessage(msg, nickName, notEscape) {
    var escaped = msg;
    if (!notEscape) {
      escaped = escapeAndAddWarning(msg);
    }
    // var event = {
    //   msg: escaped,
    //   nickName: nickName,
    // };
    // launchEvent('write', event);

    //     if (!event.msg) {
    //       return;
    //     }

    // new line
    $('#chat').prepend($(document.createElement('br')));

    // display the text
    $('#chat').prepend(
      $(document.createElement('pre'))
        .css('font-family', 'Courier New')
        .css('display', 'inline')
        .css('font-weight', 'bold')
        .css('word-break', 'break-all')
        .css('word-wrap', 'break-word')
        .css('white-space', '-moz-pre-wrap')
        .css('white-space', 'pre9')
        .css('white-space', 'pre')
        .css('white-space', 'pre-wrap')
        .css('font-size', '90%')
        .css('color', '#C0C0C0')
        .html(nickName + '&gt; ' + msg)
    );
  }
}

