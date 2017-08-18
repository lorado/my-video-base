import { Component, HostBinding, OnInit } from '@angular/core';
import { Notification } from './notification.model';
import { CoreService } from '../core.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  animations: [
    trigger('notificationState', [
      transition(':enter', [
        style({transform: 'translateY(-20px) scale(0.9)', opacity: 0, height: 0, marginBottom: 0}),
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')
      ]),
      transition(':leave', [
        animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({transform: 'translateY(20px)', opacity: 0, height: 0, marginBottom: 0}))
      ])
    ])
  ]
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  @HostBinding('class.is-clean-layout') isCleanLayout: boolean;

  constructor(private coreService: CoreService) {
  }


  ngOnInit() {
    this.coreService.layoutChanged
      .subscribe((newLayout: string) => {
        this.isCleanLayout = newLayout === 'clean';
      });

    this.coreService.notificationCreated
      .subscribe((notification: Notification) => {
          this.notifications.unshift(notification);
          if (notification.closeAfter !== null) {
            notification._timeoutStart = new Date().getTime();
            notification._timeoutRef = setTimeout(() => {
              this.removeNotification(notification);
            }, notification.closeAfter);
          }
        }
      );

    this.coreService.notificationClosed
      .subscribe((notification: Notification | boolean) => {
          if (notification === true) {
            // force closing all norifications
            for (const notific of this.notifications) {
              this.removeNotification(notific);
            }
          } else {
            this.removeNotification(<Notification>notification);
          }
        }
      );
  }

  onMouseenter(notification: Notification) {
    if (notification._timeoutRef) {
      clearTimeout(notification._timeoutRef);
      notification.closeAfter -= new Date().getTime() - notification._timeoutStart;
    }
  }

  onMouseleave(notification: Notification) {
    if (notification.closeAfter !== null) {
      notification._timeoutStart = new Date().getTime();
      notification._timeoutRef = setTimeout(() => {
        this.removeNotification(notification);
      }, notification.closeAfter);
    }
  }

  onClick(notification: Notification) {
    if (notification.closeByClick !== false) {
      clearTimeout(notification._timeoutRef);
      this.removeNotification(notification);
    }
  }

  removeNotification(notification: Notification) {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      if (notification.onClose) {
        notification.onClose();
      }
      this.notifications.splice(index, 1);
    }
  }
}
