import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Notification } from './notification/notification.model';

@Injectable()
export class CoreService {
  notificationCreated = new Subject<Notification>();
  notificationClosed = new Subject<Notification | boolean>();
  layoutChanged = new Subject<string>();

  constructor() {
  }

  createNotification(params: {
    text: string,
    type?: 'success' | 'danger' | 'warning' | 'info',
    closeAfter?: number | null,
    onClose?: Function,
    closeByClick?: boolean
  }) {
    const notification = new Notification(params);
    this.notificationCreated.next(notification);
    return notification;
  }

  closeNotification(notification: Notification) {
    this.notificationClosed.next(notification);
  }

  closeAllNotifications() {
    this.notificationClosed.next(true);
  }

}
