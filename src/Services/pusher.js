import Pusher from 'pusher-js';

class PusherService {
  constructor() {
    this.pusher = null;
    this.channels = {};
  }

  // Initialize Pusher
  init(config) {
    if (this.pusher) {
      console.warn('Pusher already initialized');
      return this.pusher;
    }

    // Enable Pusher logging for debugging
    Pusher.logToConsole = true;

    this.pusher = new Pusher(config.key, {
      cluster: config.cluster,
      encrypted: true,
      forceTLS: true,
    });

    // Connection state listeners
    this.pusher.connection.bind('connected', () => {
      console.log('✅ Pusher connected');
    });

    this.pusher.connection.bind('disconnected', () => {
      console.log('❌ Pusher disconnected');
    });

    this.pusher.connection.bind('error', (err) => {
      console.error('❌ Pusher connection error:', err);
    });

    this.pusher.connection.bind('state_change', (states) => {
      console.log('🔄 Pusher state changed:', states.previous, '->', states.current);
    });

    return this.pusher;
  }

  // Subscribe to a public channel
  subscribeToPublicChannel(channelName, events = {}) {
    if (!this.pusher) {
      console.error('Pusher not initialized');
      return null;
    }

    // Check if already subscribed
    if (this.channels[channelName]) {
      console.log(`Already subscribed to ${channelName}`);
      return this.channels[channelName];
    }

    const channel = this.pusher.subscribe(channelName);

    // Listen for subscription success
    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`✅ Successfully subscribed to ${channelName}`);
    });

    // Listen for subscription error
    channel.bind('pusher:subscription_error', (status) => {
      console.error(`❌ Subscription error for ${channelName}:`, status);
    });

    // Bind custom events
    Object.entries(events).forEach(([eventName, callback]) => {
      channel.bind(eventName, (data) => {
        console.log(`📨 Event received - ${eventName}:`, data);
        callback(data);
      });
      console.log(`🎧 Listening for event: ${eventName} on ${channelName}`);
    });

    // Store channel reference
    this.channels[channelName] = channel;

    console.log(`📡 Subscribed to ${channelName}`);
    return channel;
  }

  // Unsubscribe from a channel
  unsubscribe(channelName) {
    if (this.channels[channelName]) {
      this.pusher.unsubscribe(channelName);
      delete this.channels[channelName];
      console.log(`🔕 Unsubscribed from ${channelName}`);
    }
  }

  // Disconnect Pusher
  disconnect() {
    if (this.pusher) {
      Object.keys(this.channels).forEach((channelName) => {
        this.unsubscribe(channelName);
      });
      this.pusher.disconnect();
      this.pusher = null;
      console.log('Pusher disconnected');
    }
  }

  // Get Pusher instance
  getInstance() {
    return this.pusher;
  }
}

// Export singleton instance
export default new PusherService();