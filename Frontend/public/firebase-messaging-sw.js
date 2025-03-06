// public/firebase-messaging-sw.js

self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    
    const title = data.title || "Reminder!";
    const options = {
      body: data.body || "You have a new reminder.",
      icon: data.icon || '/logo192.png', // Use your app logo or a custom icon
      tag: data.tag || 'reminder-tag',
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
  