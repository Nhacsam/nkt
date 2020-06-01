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
    this.eventEmitter.emit('userListChanged', this.users);
  }

  saveUser(key, alias, nickName) {
    if (!key) {
      return;
    }

    const savedUser = this.users.find((user) => user.alias === alias);
    if (savedUser) {
      savedUser.lastMessagesDistance = new Date() - savedUser.lastMessage;
      savedUser.lastMessage = new Date();
      return savedUser;
    }

    const user = {
      nickName,
      publicKey: key,
      lastMessage: new Date(),
      lastMessagesDistance: 1000,
      muted: false,
      alias,
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
      return now - user.lastMessage < 2000 + user.lastMessagesDistance * 4;
    });

    const listChanged = newList.length !== this.users.length;
    this.users = newList;
    if (listChanged) {
      this.eventEmitter.emit('userListChanged', this.users);
    }
  }
}
