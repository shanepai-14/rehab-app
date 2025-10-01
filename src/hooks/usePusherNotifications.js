// hooks/usePusherNotifications.js
import { useEffect } from 'react';
import { toast } from 'sonner';
import pusherService from '../Services/pusher';

const KEY = import.meta.env.VITE_APP_PUSHER_APP_KEY;
const CLUSTER = import.meta.env.VITE_APP_PUSHER_APP_CLUSTER;

export const usePusherNotifications = (user) => {
  
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
        
        toast.success(data.message, {
          duration: 10000,
          position: 'top-right',
        });
      },

      'appointment.updated': (data) => {
        console.log('🔄 Appointment updated event received:', data);
        
        toast.info(data.message, {
          duration: 10000,
          position: 'top-right',
        });
      },

      'appointment.cancelled': (data) => {
        console.log('❌ Appointment cancelled event received:', data);
        
        toast.error(data.message, {
          duration: 10000,
          position: 'top-right',
        });
      },
      'appointment.reminder': (data) => {
        console.log('❌ Appointment reminder event received:', data);
        
        toast.error(data.message, {
          duration: 10000,
          position: 'top-right',
        });
      },
    });

    return () => {
      console.log('🧹 Cleaning up Pusher subscription');
      pusherService.unsubscribe(channelName);
    };
  }, [user]);
};