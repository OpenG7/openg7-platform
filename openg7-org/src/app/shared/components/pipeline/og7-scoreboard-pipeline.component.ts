import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { PipelineStepStatus } from '@app/store/connections/connections.selectors';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'og7-scoreboard-pipeline',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './og7-scoreboard-pipeline.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « shared/components/pipeline » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Og7 Scoreboard Pipeline ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns Og7ScoreboardPipelineComponent gérée par le framework.
 */
export class Og7ScoreboardPipelineComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly browser = isPlatformBrowser(this.platformId);

  private timer: ReturnType<typeof setInterval> | null = null;

  readonly steps = input<readonly PipelineStepStatus[]>([]);
  readonly creating = input(false);
  readonly startedAt = input<string | null>(null);

  protected readonly elapsed = signal<string | null>(null);

  constructor() {
    effect(() => {
      const start = this.startedAt();
      this.stopTimer();
      if (!this.browser || !start) {
        this.elapsed.set(null);
        return;
      }
      this.elapsed.set(this.formatElapsed(start));
      this.timer = setInterval(() => {
        this.elapsed.set(this.formatElapsed(start));
      }, 1000);
    });

    this.destroyRef.onDestroy(() => this.stopTimer());
  }

  protected badgeClass(status: PipelineStepStatus['status']): string {
    switch (status) {
      case 'completed':
        return 'bg-[#ecfdf5] text-[#166534] border border-[#bbf7d0] shadow-sm';
      case 'active':
        return 'bg-[#2563eb] text-white shadow-[0_18px_42px_-26px_rgba(37,99,235,0.6)]';
      default:
        return 'bg-white text-subtle border border-[rgba(148,163,184,0.35)]';
    }
  }

  protected highlightClass(status: PipelineStepStatus['status']): string {
    if (status === 'active') {
      return 'bg-[#2563eb15] blur-xl';
    }
    if (status === 'completed') {
      return 'bg-[#16a34a14] blur-lg';
    }
    return 'bg-transparent';
  }

  protected progressWidth(status: PipelineStepStatus['status']): number {
    switch (status) {
      case 'completed':
        return 100;
      case 'active':
        return 55;
      default:
        return 12;
    }
  }

  protected stageLabel(stage: PipelineStepStatus['stage']): string {
    return `pipeline.${stage}`;
  }

  protected stageShortLabel(stage: PipelineStepStatus['stage']): string {
    switch (stage) {
      case 'intro':
        return 'IN';
      case 'reply':
        return 'RE';
      case 'meeting':
        return 'MT';
      case 'review':
        return 'RV';
      case 'deal':
        return 'DL';
      default:
        return '??';
    }
  }

  protected timestampLabel(timestamp?: string): string {
    if (!timestamp) {
      return '—';
    }
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private formatElapsed(start: string): string {
    const startDate = new Date(start).getTime();
    if (!Number.isFinite(startDate)) {
      return '';
    }
    const diff = Math.max(Date.now() - startDate, 0);
    const totalSeconds = Math.floor(diff / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
}
