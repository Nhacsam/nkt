class EventEmitter {
  constructor() {
    this.listeners = [];

    this.byEvents = {};
  }

  emit(event, data) {
    this.listeners.forEach((cb) => {
      cb(event, data);
    });

    if (!!this.byEvents[event]) {
      this.byEvents[event].forEach((cb) => {
        cb(data);
      });
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  on(event, listener) {
    if (!this.byEvents[event]) {
      this.byEvents[event] = [listener];
      return;
    }
    this.byEvents[event].push(listener);
  }
}
