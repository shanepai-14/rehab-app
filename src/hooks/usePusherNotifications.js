// hooks/usePusherNotifications.js
import { useEffect } from 'react';
import { toast } from 'sonner';
import pusherService from '../Services/pusher';
import { useNotifications } from '../context/NotificationContext';

const KEY = import.meta.env.VITE_APP_PUSHER_APP_KEY;
const CLUSTER = import.meta.env.VITE_APP_PUSHER_APP_CLUSTER;

export const usePusherNotifications = (user) => {
  const { addNotification } = useNotifications();
  
  useEffect(() => {
    if (!user) {
      console.log('⚠️ Missing user');
      return;
    }

    console.log('🚀 Initializing Pusher for user:', user.contact_number);
    
    // Initialize Pusher (no auth needed)
    pusherService.init({
      key: KEY,
      cluster: CLUSTER,
    });

    // Use PUBLIC channel (remove 'private-' prefix)
    const channelName = `user.${user.contact_number}`;
    
    console.log(`🔔 Setting up listeners for ${channelName}`);
    
    pusherService.subscribeToPublicChannel(channelName, {
      'appointment.created': (data) => {
        console.log('📅 Appointment created event received:', data);
        
        // Add to notification context
        addNotification({
          id: Date.now(), // temporary ID, replace with actual from backend
          title: 'Appointment Created',
          message: data.message,
          type: 'success',
          action_url: data.action_url || `/appointments/${data.appointment_id}`,
          is_read: false,
          created_at: new Date().toISOString()
        });
        
        toast.success(data.message, {
          duration: 10000,
          position: 'top-right',
        });
      },

      'appointment.updated': (data) => {
        console.log('🔄 Appointment updated event received:', data);
        
        // Add to notification context
        addNotification({
          id: Date.now(),
          title: 'Appointment Updated',
          message: data.message,
          type: 'info',
          action_url: data.action_url || `/appointments/${data.appointment_id}`,
          is_read: false,
          created_at: new Date().toISOString()
        });
        
        toast.info(data.message, {
          duration: 10000,
          position: 'top-right',
        });
      },

      'appointment.cancelled': (data) => {
        console.log('❌ Appointment cancelled event received:', data);
        
        // Add to notification context
        addNotification({
          id: Date.now(),
          title: 'Appointment Cancelled',
          message: data.message,
          type: 'error',
          action_url: data.action_url || `/appointments/${data.appointment_id}`,
          is_read: false,
          created_at: new Date().toISOString()
        });
        
        toast.error(data.message, {
          duration: 10000,
          position: 'top-right',
        });
      },

      'appointment.reminder': (data) => {
        console.log('⏰ Appointment reminder event received:', data);
        
        // Add to notification context
        addNotification({
          id: Date.now(),
          title: 'Appointment Reminder',
          message: data.message,
          type: 'warning',
          action_url: data.action_url || `/appointments/${data.appointment_id}`,
          is_read: false,
          created_at: new Date().toISOString()
        });
        
        toast.warning(data.message, {
          duration: 10000,
          position: 'top-right',
        });
      },

      // Generic notification event (if you create notifications from backend)
      'notification.created': (data) => {
        console.log('🔔 New notification received:', data);
        
        // Add to notification context
        addNotification({
          id: data.id,
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          action_url: data.action_url,
          related_type: data.related_type,
          related_id: data.related_id,
          is_read: false,
          created_at: data.created_at
        });
        
        // Show toast based on type
        const toastMap = {
          success: toast.success,
          error: toast.error,
          warning: toast.warning,
          info: toast.info
        };
        
        const showToast = toastMap[data.type] || toast.info;
        showToast(data.message, {
          duration: 10000,
          position: 'top-right',
        });
      },

  'message.sent': (data) => {
        console.log('💬 New message received:', data);
        
        // Only show notification if the message is for this user (not sent by them)
        if (data.receiver_contact_number === user.contact_number) {
          // Add to notification context
          addNotification({
            id: data.id,
            title: 'New Message',
            message: `${data.sender_name}: ${data.message.substring(0, 50)}${data.message.length > 50 ? '...' : ''}`,
            type: 'info',
            action_url: '/chat',
            related_type: 'chat',
            related_id: data.id,
            is_read: false,
            created_at: data.created_at
          });
          
          // Show toast notification
          toast.info(`New message from ${data.sender_name}`, {
            description: data.message.substring(0, 100),
            duration: 5000,
            position: 'top-right',
            action: {
              label: 'View',
              onClick: () => {
                window.location.href = '/chat';
              }
            }
          });
        }
        
        // If there's a callback for new messages (for live chat updates), call it
        if (onNewMessage) {
          onNewMessage(data);
        }
      },

      
    });

    

    return () => {
      console.log('🧹 Cleaning up Pusher subscription');
      pusherService.unsubscribe(channelName);
    };
  }, [user, addNotification]);
};