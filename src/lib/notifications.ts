'use client';

import { supabase } from './supabase/client';
import { logger } from './logger';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Notification interface representing a user notification in Supabase
 */
export interface Notification {
  id: string;
  user_id: string;
  userId: string; // Backward compatibility
  sender_id?: string;
  senderId?: string; // Backward compatibility
  sender_name?: string;
  senderName?: string; // Backward compatibility
  sender_role?: string;
  senderRole?: string; // Backward compatibility
  type: 'evaluation' | 'badge' | 'announcement' | 'reminder' | 'message' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  created_at: string; // ISO string timestamp
  createdAt: string | Date; // Backward compatibility
  action_url?: string;
  actionUrl?: string; // Backward compatibility
  metadata?: Record<string, unknown>;
}

/**
 * Options for fetching notifications
 */
export interface FetchNotificationsOptions {
  limit?: number;
  unreadOnly?: boolean;
}

/**
 * Callback type for real-time notification subscriptions
 */
export type NotificationCallback = (notifications: Notification[]) => void;

/**
 * Callback type for subscription errors
 */
export type NotificationErrorCallback = (error: Error) => void;

/**
 * Convert database row to Notification with backward compatibility
 */
function mapNotification(row: any): Notification {
  return {
    id: row.id,
    user_id: row.user_id,
    userId: row.user_id, // Backward compatibility
    sender_id: row.sender_id,
    senderId: row.sender_id, // Backward compatibility
    sender_name: row.sender_name,
    senderName: row.sender_name, // Backward compatibility
    sender_role: row.sender_role,
    senderRole: row.sender_role, // Backward compatibility
    type: row.type,
    title: row.title,
    message: row.message,
    read: row.read,
    created_at: row.created_at,
    createdAt: row.created_at, // Backward compatibility
    action_url: row.action_url,
    actionUrl: row.action_url, // Backward compatibility
    metadata: row.metadata,
  };
}

/**
 * Fetch notifications for a specific user
 *
 * @param userId - The user ID to fetch notifications for
 * @param options - Optional fetch parameters (limit, unreadOnly)
 * @returns Promise<Notification[]> Array of notifications sorted by newest first
 *
 * @example
 * const notifications = await fetchNotifications(userId, { limit: 20, unreadOnly: true });
 */
export async function fetchNotifications(
  userId: string,
  options: FetchNotificationsOptions = {}
): Promise<Notification[]> {
  try {
    const { limit: notificationLimit = 50, unreadOnly = false } = options;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(notificationLimit);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(mapNotification);
  } catch (error) {
    logger.error('fetchNotifications - Error fetching notifications:', error);
    throw new Error(
      `Failed to fetch notifications: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Mark a single notification as read
 *
 * @param notificationId - The ID of the notification to mark as read
 * @returns Promise<void>
 *
 * @example
 * await markAsRead(notificationId);
 */
export async function markAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await (supabase
      .from('notifications') as any)
      .update({
        read: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    logger.error('markAsRead - Error marking notification as read:', error);
    throw new Error(
      `Failed to mark notification as read: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Mark all unread notifications as read for a specific user
 *
 * @param userId - The user ID to mark all notifications as read
 * @returns Promise<number> Number of notifications updated
 *
 * @example
 * const updatedCount = await markAllAsRead(userId);
 * console.log(`Marked ${updatedCount} notifications as read`);
 */
export async function markAllAsRead(userId: string): Promise<number> {
  try {
    const { data, error } = await (supabase
      .from('notifications') as any)
      .update({
        read: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('read', false)
      .select();

    if (error) throw error;

    return data?.length || 0;
  } catch (error) {
    logger.error('markAllAsRead - Error marking all notifications as read:', error);
    throw new Error(
      `Failed to mark all notifications as read: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete a single notification
 *
 * @param notificationId - The ID of the notification to delete
 * @returns Promise<void>
 *
 * @example
 * await deleteNotification(notificationId);
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    logger.error('deleteNotification - Error deleting notification:', error);
    throw new Error(
      `Failed to delete notification: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete multiple notifications
 *
 * @param notificationIds - Array of notification IDs to delete
 * @returns Promise<number> Number of notifications deleted
 *
 * @example
 * const deletedCount = await deleteMultipleNotifications([id1, id2, id3]);
 */
export async function deleteMultipleNotifications(
  notificationIds: string[]
): Promise<number> {
  try {
    if (notificationIds.length === 0) {
      return 0;
    }

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .in('id', notificationIds)
      .select();

    if (error) throw error;

    return data?.length || 0;
  } catch (error) {
    logger.error('deleteMultipleNotifications - Error deleting notifications:', error);
    throw new Error(
      `Failed to delete notifications: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Subscribe to real-time notifications for a specific user
 *
 * Uses Supabase Realtime to provide real-time updates whenever notifications change.
 * This is useful for displaying live notification feeds with automatic updates.
 *
 * @param userId - The user ID to subscribe to
 * @param callback - Function called with notification updates (notifications array)
 * @param errorCallback - Optional function called on subscription errors
 * @returns Unsubscribe function to stop listening for updates
 *
 * @example
 * const unsubscribe = subscribeToNotifications(
 *   userId,
 *   (notifications) => {
 *     console.log('Notifications updated:', notifications);
 *     setNotifications(notifications);
 *   },
 *   (error) => console.error('Subscription error:', error)
 * );
 *
 * // Later, to stop listening:
 * unsubscribe();
 */
export function subscribeToNotifications(
  userId: string,
  callback: NotificationCallback,
  errorCallback?: NotificationErrorCallback
): () => void {
  try {
    // Initial fetch
    fetchNotifications(userId).then(callback).catch(errorCallback || (() => {}));

    // Set up real-time subscription
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          // Re-fetch all notifications when any change occurs
          try {
            const notifications = await fetchNotifications(userId);
            callback(notifications);
          } catch (error) {
            logger.error('subscribeToNotifications - Error in real-time callback:', error);
            errorCallback?.(error as Error);
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    logger.error('subscribeToNotifications - Error setting up subscription:', error);
    throw new Error(
      `Failed to subscribe to notifications: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Subscribe to real-time unread notifications for a specific user
 *
 * @param userId - The user ID to subscribe to
 * @param callback - Function called with unread notifications array
 * @param errorCallback - Optional function called on subscription errors
 * @returns Unsubscribe function to stop listening for updates
 *
 * @example
 * const unsubscribe = subscribeToUnreadNotifications(userId, (unread) => {
 *   setUnreadCount(unread.length);
 * });
 */
export function subscribeToUnreadNotifications(
  userId: string,
  callback: NotificationCallback,
  errorCallback?: NotificationErrorCallback
): () => void {
  try {
    // Initial fetch
    fetchNotifications(userId, { unreadOnly: true })
      .then(callback)
      .catch(errorCallback || (() => {}));

    // Set up real-time subscription
    const channel = supabase
      .channel(`notifications_unread:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          // Re-fetch unread notifications when any change occurs
          try {
            const notifications = await fetchNotifications(userId, { unreadOnly: true });
            callback(notifications);
          } catch (error) {
            logger.error('subscribeToUnreadNotifications - Error in real-time callback:', error);
            errorCallback?.(error as Error);
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    logger.error('subscribeToUnreadNotifications - Error setting up subscription:', error);
    throw new Error(
      `Failed to subscribe to unread notifications: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get count of unread notifications for a user
 *
 * @param userId - The user ID to check
 * @returns Promise<number> Count of unread notifications
 *
 * @example
 * const unreadCount = await getUnreadCount(userId);
 * console.log(`You have ${unreadCount} unread notifications`);
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    logger.error('getUnreadCount - Error getting unread count:', error);
    throw new Error(
      `Failed to get unread count: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get notifications by type for a specific user
 *
 * @param userId - The user ID
 * @param type - The notification type to filter by
 * @param notificationLimit - Maximum number of notifications to return (default: 50)
 * @returns Promise<Notification[]> Notifications of the specified type
 *
 * @example
 * const badgeNotifications = await getNotificationsByType(userId, 'badge', 10);
 */
export async function getNotificationsByType(
  userId: string,
  type: Notification['type'],
  notificationLimit: number = 50
): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false })
      .limit(notificationLimit);

    if (error) throw error;

    return (data || []).map(mapNotification);
  } catch (error) {
    logger.error('getNotificationsByType - Error fetching notifications by type:', error);
    throw new Error(
      `Failed to fetch notifications by type: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Clear all notifications for a user (delete them)
 *
 * @param userId - The user ID to clear notifications for
 * @returns Promise<number> Number of notifications deleted
 *
 * @example
 * const deletedCount = await clearAllNotifications(userId);
 * console.log(`Cleared ${deletedCount} notifications`);
 */
export async function clearAllNotifications(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    return data?.length || 0;
  } catch (error) {
    logger.error('clearAllNotifications - Error clearing notifications:', error);
    throw new Error(
      `Failed to clear notifications: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ==================== NOTIFICATION SENDING FUNCTIONS ====================

/**
 * Create a new notification
 *
 * @param notification - Notification data (without id)
 * @returns Promise<string> ID of the created notification
 *
 * @example
 * const notificationId = await createNotification({
 *   user_id: 'user123',
 *   sender_id: 'sender456',
 *   sender_name: 'John Doe',
 *   sender_role: 'teacher',
 *   type: 'announcement',
 *   title: 'New Assignment',
 *   message: 'You have a new assignment',
 *   read: false,
 * });
 */
export async function createNotification(
  notification: Omit<Notification, 'id' | 'userId' | 'senderId' | 'senderName' | 'senderRole' | 'createdAt' | 'actionUrl'>
): Promise<string> {
  try {
    const { data, error } = await (supabase
      .from('notifications') as any)
      .insert([notification])
      .select()
      .single();

    if (error) throw error;

    logger.log('Notification created:', data.id);
    return data.id;
  } catch (error) {
    logger.error('createNotification - Error creating notification:', error);
    throw new Error(
      `Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Send notification to a single user
 *
 * @param userId - Recipient user ID
 * @param senderId - Sender user ID
 * @param senderName - Sender's display name
 * @param senderRole - Sender's role
 * @param title - Notification title
 * @param message - Notification message
 * @param type - Notification type
 * @param actionUrl - Optional action URL
 * @param metadata - Optional metadata
 * @returns Promise<string> ID of the created notification
 *
 * @example
 * await sendNotificationToUser(
 *   'student123',
 *   'teacher456',
 *   'Ms. Smith',
 *   'teacher',
 *   'Grade Posted',
 *   'Your assignment has been graded',
 *   'evaluation'
 * );
 */
export async function sendNotificationToUser(
  userId: string,
  senderId: string,
  senderName: string,
  senderRole: string,
  title: string,
  message: string,
  type: Notification['type'] = 'info',
  actionUrl?: string,
  metadata?: Record<string, unknown>
): Promise<string> {
  return createNotification({
    user_id: userId,
    sender_id: senderId,
    sender_name: senderName,
    sender_role: senderRole,
    type,
    title,
    message,
    read: false,
    created_at: new Date().toISOString(),
    action_url: actionUrl,
    metadata,
  });
}

/**
 * Send notification to multiple users (bulk)
 *
 * @param userIds - Array of recipient user IDs
 * @param senderId - Sender user ID
 * @param senderName - Sender's display name
 * @param senderRole - Sender's role
 * @param title - Notification title
 * @param message - Notification message
 * @param type - Notification type
 * @param actionUrl - Optional action URL
 * @param metadata - Optional metadata
 * @returns Promise<number> Number of notifications sent
 *
 * @example
 * await sendBulkNotifications(
 *   ['student1', 'student2', 'student3'],
 *   'teacher123',
 *   'Mr. Johnson',
 *   'teacher',
 *   'Class Announcement',
 *   'Class is canceled tomorrow',
 *   'announcement'
 * );
 */
export async function sendBulkNotifications(
  userIds: string[],
  senderId: string,
  senderName: string,
  senderRole: string,
  title: string,
  message: string,
  type: Notification['type'] = 'info',
  actionUrl?: string,
  metadata?: Record<string, unknown>
): Promise<number> {
  try {
    if (!userIds || userIds.length === 0) {
      return 0;
    }

    const notifications = userIds.map(userId => ({
      user_id: userId,
      sender_id: senderId,
      sender_name: senderName,
      sender_role: senderRole,
      type,
      title,
      message,
      read: false,
      created_at: new Date().toISOString(),
      action_url: actionUrl,
      metadata,
    }));

    const { data, error } = await (supabase
      .from('notifications') as any)
      .insert(notifications)
      .select();

    if (error) throw error;

    logger.log(`Bulk notifications sent: ${data?.length || 0} recipients`);
    return data?.length || 0;
  } catch (error) {
    logger.error('sendBulkNotifications - Error sending bulk notifications:', error);
    throw new Error(
      `Failed to send bulk notifications: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Send notification to all users in an institution
 *
 * @param institutionId - Institution ID
 * @param senderId - Sender user ID
 * @param senderName - Sender's display name
 * @param senderRole - Sender's role
 * @param title - Notification title
 * @param message - Notification message
 * @param type - Notification type
 * @param targetRole - Optional: Send only to specific role in institution
 * @param actionUrl - Optional action URL
 * @param metadata - Optional metadata
 * @returns Promise<number> Number of notifications sent
 *
 * @example
 * await sendInstitutionNotification(
 *   'school123',
 *   'admin456',
 *   'Principal Williams',
 *   'admin',
 *   'School Holiday',
 *   'School will be closed next Monday',
 *   'announcement'
 * );
 */
export async function sendInstitutionNotification(
  institutionId: string,
  senderId: string,
  senderName: string,
  senderRole: string,
  title: string,
  message: string,
  type: Notification['type'] = 'info',
  targetRole?: 'student' | 'teacher' | 'admin' | 'institution',
  actionUrl?: string,
  metadata?: Record<string, unknown>
): Promise<number> {
  try {
    let query = supabase
      .from('users')
      .select('id')
      .eq('institution_id', institutionId);

    if (targetRole) {
      query = query.eq('role', targetRole);
    }

    const { data: users, error } = await query;

    if (error) throw error;

    const userIds = ((users || []) as any[]).map(user => user.id);

    return sendBulkNotifications(
      userIds,
      senderId,
      senderName,
      senderRole,
      title,
      message,
      type,
      actionUrl,
      metadata
    );
  } catch (error) {
    logger.error('sendInstitutionNotification - Error sending institution notification:', error);
    throw new Error(
      `Failed to send institution notification: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Send notification to all users of a specific role
 *
 * @param targetRole - Target role to send notification to
 * @param senderId - Sender user ID
 * @param senderName - Sender's display name
 * @param senderRole - Sender's role
 * @param title - Notification title
 * @param message - Notification message
 * @param type - Notification type
 * @param actionUrl - Optional action URL
 * @param metadata - Optional metadata
 * @returns Promise<number> Number of notifications sent
 *
 * @example
 * await sendRoleNotification(
 *   'student',
 *   'admin123',
 *   'Admin',
 *   'admin',
 *   'Platform Update',
 *   'New features are now available',
 *   'announcement'
 * );
 */
export async function sendRoleNotification(
  targetRole: 'student' | 'teacher' | 'admin' | 'institution',
  senderId: string,
  senderName: string,
  senderRole: string,
  title: string,
  message: string,
  type: Notification['type'] = 'info',
  actionUrl?: string,
  metadata?: Record<string, unknown>
): Promise<number> {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .eq('role', targetRole);

    if (error) throw error;

    const userIds = ((users || []) as any[]).map(user => user.id);

    return sendBulkNotifications(
      userIds,
      senderId,
      senderName,
      senderRole,
      title,
      message,
      type,
      actionUrl,
      metadata
    );
  } catch (error) {
    logger.error('sendRoleNotification - Error sending role notification:', error);
    throw new Error(
      `Failed to send role notification: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
