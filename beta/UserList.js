class UserList {
  constructor(eventEmitter) {
    this.users = [];
    this.eventEmitter = eventEmitter;

    eventEmitter.on('ping', () => this.refreshUserList());
  }

  toggleMuteUser(user) {
    if (!user) {
      return;
    }
    user.isMuted = !user.isMuted;
    if (window.nkt.userList[user.id]) {
      window.nkt.userList[user.id].dontSendTo = user.isMuted;
    }
    this.eventEmitter.emit('userListChanged', this.users);
  }

  saveUser(id, nickName) {
    if (!id) {
      return;
    }

    const savedUser = this.users.find((user) => user.id === id);
    if (savedUser) {
      savedUser.lastMessagesDistance = new Date() - savedUser.lastMessage;
      savedUser.lastMessage = new Date();
      return savedUser;
    }

    const user = {
      id,
      nickName,
      lastMessage: new Date(),
      lastMessagesDistance: 1000,
      muted: false,
    };

    this.users.push(user);
    this.eventEmitter.emit('newUser', nickName);
    this.eventEmitter.emit('userListChanged', this.users);
    return user;
  }

  getUsers() {
    return this.users;
  }

  refreshUserList() {
    const now = new Date();
    const newList = this.users.filter((user) => {
      const isAlive =
        now - user.lastMessage < 2000 + user.lastMessagesDistance * 4;
      if (!isAlive && window.nkt.userList[user.id]) {
        window.nkt.userList[user.id].isUnreachable = true;
      }
      return isAlive;
    });

    const listChanged = newList.length !== this.users.length;
    this.users = newList;
    if (listChanged) {
      this.eventEmitter.emit('userListChanged', this.users);
    }
  }
}
