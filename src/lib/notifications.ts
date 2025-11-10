'use client';

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  onSnapshot,
  Query,
  QueryConstraint,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase.client';
import { logger } from './logger';

/**
 * Notification interface representing a user notification in Firestore
 */
export interface Notification {
  id: string;
  userId: string;
  senderId?: string;
  senderName?: string;
  senderRole?: string;
  type: 'evaluation' | 'badge' | 'announcement' | 'reminder' | 'message' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp | Date;
  actionUrl?: string;
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

    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    ];

    if (unreadOnly) {
      constraints.push(where('read', '==', false));
    }

    constraints.push(limit(notificationLimit));

    const notificationsQuery = query(
      collection(db, 'notifications'),
      ...constraints
    );

    const querySnapshot = await getDocs(notificationsQuery);
    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...(doc.data() as Omit<Notification, 'id'>),
      });
    });

    return notifications;
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
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      updatedAt: Timestamp.now(),
    });
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
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(notificationsQuery);

    if (querySnapshot.empty) {
      return 0;
    }

    const batch = writeBatch(db);
    let updateCount = 0;

    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        updatedAt: Timestamp.now(),
      });
      updateCount++;
    });

    await batch.commit();
    return updateCount;
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
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
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

    const batch = writeBatch(db);
    let deleteCount = 0;

    notificationIds.forEach((id) => {
      const notificationRef = doc(db, 'notifications', id);
      batch.delete(notificationRef);
      deleteCount++;
    });

    await batch.commit();
    return deleteCount;
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
 * Uses Firebase's onSnapshot to provide real-time updates whenever notifications change.
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
): Unsubscribe {
  try {
    const notificationsQuery: Query = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (querySnapshot) => {
        const notifications: Notification[] = [];

        querySnapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...(doc.data() as Omit<Notification, 'id'>),
          });
        });

        callback(notifications);
      },
      (error) => {
        logger.error('subscribeToNotifications - Subscription error:', error);
        errorCallback?.(error as Error);
      }
    );

    return unsubscribe;
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
): Unsubscribe {
  try {
    const notificationsQuery: Query = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (querySnapshot) => {
        const notifications: Notification[] = [];

        querySnapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...(doc.data() as Omit<Notification, 'id'>),
          });
        });

        callback(notifications);
      },
      (error) => {
        logger.error('subscribeToUnreadNotifications - Subscription error:', error);
        errorCallback?.(error as Error);
      }
    );

    return unsubscribe;
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
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(notificationsQuery);
    return querySnapshot.size;
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
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('type', '==', type),
      orderBy('createdAt', 'desc'),
      limit(notificationLimit)
    );

    const querySnapshot = await getDocs(notificationsQuery);
    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...(doc.data() as Omit<Notification, 'id'>),
      });
    });

    return notifications;
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
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(notificationsQuery);

    if (querySnapshot.empty) {
      return 0;
    }

    const batch = writeBatch(db);
    let deleteCount = 0;

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      deleteCount++;
    });

    await batch.commit();
    return deleteCount;
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
 *   userId: 'user123',
 *   senderId: 'sender456',
 *   senderName: 'John Doe',
 *   senderRole: 'teacher',
 *   type: 'announcement',
 *   title: 'New Assignment',
 *   message: 'You have a new assignment',
 *   read: false,
 *   createdAt: Timestamp.now()
 * });
 */
export async function createNotification(
  notification: Omit<Notification, 'id'>
): Promise<string> {
  try {
    const { addDoc } = await import('firebase/firestore');
    const docRef = await addDoc(collection(db, 'notifications'), notification);
    logger.log('Notification created:', docRef.id);
    return docRef.id;
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
    userId,
    senderId,
    senderName,
    senderRole,
    type,
    title,
    message,
    read: false,
    createdAt: Timestamp.now(),
    actionUrl,
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

    const batch = writeBatch(db);
    const notificationsRef = collection(db, 'notifications');
    let count = 0;

    for (const userId of userIds) {
      const notificationData = {
        userId,
        senderId,
        senderName,
        senderRole,
        type,
        title,
        message,
        read: false,
        createdAt: Timestamp.now(),
        actionUrl,
        metadata,
      };

      const docRef = doc(notificationsRef);
      batch.set(docRef, notificationData);
      count++;
    }

    await batch.commit();
    logger.log(`Bulk notifications sent: ${count} recipients`);
    return count;
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
    const usersRef = collection(db, 'users');
    const constraints: QueryConstraint[] = [
      where('institutionId', '==', institutionId)
    ];

    if (targetRole) {
      constraints.push(where('role', '==', targetRole));
    }

    const usersQuery = query(usersRef, ...constraints);
    const usersSnapshot = await getDocs(usersQuery);

    const userIds = usersSnapshot.docs.map(doc => doc.id);

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
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, where('role', '==', targetRole));
    const usersSnapshot = await getDocs(usersQuery);

    const userIds = usersSnapshot.docs.map(doc => doc.id);

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
