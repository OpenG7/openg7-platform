import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FeedReply } from '../models/feed.models';
import { JsonDateAgoPipe } from '../pipes/json-date-ago.pipe';

@Component({
  selector: 'og7-feed-replies',
  standalone: true,
  imports: [CommonModule, TranslateModule, JsonDateAgoPipe],
  templateUrl: './og7-feed-replies.component.html',
  styleUrls: ['./og7-feed-replies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « domains/feed/feature/og7-feed-replies » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Og7 Feed Replies ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns Og7FeedRepliesComponent gérée par le framework.
 */
export class Og7FeedRepliesComponent {
  readonly replies = input<readonly FeedReply[]>([]);
}
