class NotificationService {
  constructor() {
    this.subscribers = new Map();
  }

  subscribe(userId, callback) {
    this.subscribers.set(userId, callback);
  }

  unsubscribe(userId) {
    this.subscribers.delete(userId);
  }

  sendNotification(userId, notification) {
    const callback = this.subscribers.get(userId);
    if (callback) {
      callback(notification);
    }
  }

  broadcastSignal(signal) {
    const notification = {
      title: `${signal.signal} Signal`,
      body: `${signal.symbol}: Entry at $${signal.entry}`,
      data: signal,
      timestamp: Date.now()
    };

    this.subscribers.forEach((callback) => {
      callback(notification);
    });
  }
}

module.exports = NotificationService;
