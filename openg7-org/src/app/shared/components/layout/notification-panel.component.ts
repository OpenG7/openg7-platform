import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  NotificationEntry,
  injectNotificationStore,
} from '@app/core/observability/notification.store';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'og7-notification-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, DatePipe, TranslateModule],
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « shared/components/layout » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Notification Panel ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns NotificationPanelComponent gérée par le framework.
 */
export class NotificationPanelComponent {
  private readonly notificationsStore = injectNotificationStore();

  readonly notifications = this.notificationsStore.entries;
  readonly unreadCount = this.notificationsStore.unreadCount;
  readonly hasUnread = this.notificationsStore.hasUnread;
  readonly lastDeliveryError = this.notificationsStore.lastDeliveryError;

  readonly totalCount = computed(() => this.notifications().length);

  trackById(_: number, item: NotificationEntry): string {
    return item.id;
  }

  iconFor(type: NotificationEntry['type']): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  }

  markRead(id: string): void {
    this.notificationsStore.markAsRead(id);
  }

  markAllRead(): void {
    this.notificationsStore.markAllRead();
  }

  dismiss(id: string): void {
    this.notificationsStore.dismiss(id);
  }

  clear(): void {
    this.notificationsStore.clearHistory();
  }

  resetDeliveryError(): void {
    this.notificationsStore.resetDeliveryError();
  }
}
