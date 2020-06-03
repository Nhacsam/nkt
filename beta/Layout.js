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

class Layout {
  constructor(eventEmitter, socket, userList) {
    this.eventEmitter = eventEmitter;
    this.socket = socket;
    this.eventEmitter.subscribe(this.onEvent.bind(this));
    this.userList = userList;
    this.setupPluginToggle();
  }

  setupPluginToggle() {
    document.getElementById('plugin-toggle').addEventListener('click', () => {
      document
        .getElementById('plugin-list')
        .classList.toggle('plugin-list--hidden');
    });
  }

  onEvent(event, eData) {
    switch (event) {
      case 'write':
        return this.writeMessage(eData.data.payload, eData.nickName);
      case 'ready':
        return this.onSocketReady();
      case 'userListChanged':
        return this.updateUserList(eData);
      case 'pluginListChanged':
        return this.updatePluginList(eData);
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

  escapeAndAddWarning(msg) {
    var escaped = escapeHTML(msg);
    if (escaped === msg) {
      return escaped;
    }
    return this.getEscapeWarningTag(escaped, msg);
  }

  getEscapeWarningTag(escaped, originalMessage) {
    const withWarning =
      'This message (' + escaped + ') may be unsafe, click to show';
    return $('<a />')
      .addClass('message__content_escaped_link')
      .addClass('message__content_escaped_link--escaped')
      .html(withWarning)
      .data('escaped', true)
      .click(function () {
        const isEscaped = $(this).data('escaped');
        $(this).data('escaped', !isEscaped);

        if (isEscaped) {
          $(this)
            .html(originalMessage)
            .removeClass('message__content_escaped_link--escaped');
        } else {
          $(this).html(withWarning);
        }
      });
  }

  /**
   * Write a message on the window
   * @param string msg Message to display
   * @param string nickName Source of the message (nickname)
   * @param boolean notEscape set to true to not escape HTML (optional)
   */
  writeMessage(msg, nickName, notEscape) {
    let escaped = msg;
    if (!notEscape) {
      escaped = this.escapeAndAddWarning(msg);
    }

    const $message = $('<div class="message" />');
    $message
      .append($('<div class="message__nickname" />').html(nickName))
      .append($('<div class="message__separator" />').html('&gt;'))
      .append($('<div class="message__content" />').html(escaped));
    $('#chat').prepend($message);
  }

  updatePluginList(plugins) {
    const tag = document.getElementById('plugin-list');
    tag.innerHTML = '';

    plugins.forEach((plugin) => {
      const name = plugin.name;

      const container = document.createElement('div');
      container.classList.add('plugin');

      const toggleTag = document.createElement('input');
      toggleTag.classList.add('plugin__checkbox');
      toggleTag.setAttribute('type', 'checkbox');
      toggleTag.setAttribute('id', name);
      toggleTag.addEventListener('click', () =>
        this.eventEmitter.emit('togglePlugin', name)
      );
      toggleTag.checked = plugin.active;

      const nameTag = document.createElement('label');
      nameTag.classList.add('plugin__name');
      nameTag.setAttribute('for', name);
      nameTag.append(name);

      container.append(toggleTag);
      container.append(nameTag);
      tag.append(container);
    });
  }
}

