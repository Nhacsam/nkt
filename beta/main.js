(function ($) {
  $(document).ready(function () {
    const eventEmitter = new EventEmitter();
    const userList = new UserList(eventEmitter);
    const sock = new Socket(eventEmitter, userList);
    const layout = new Layout(eventEmitter, sock, userList);
    jQuery.socket = sock;
  });
})(jQuery);
