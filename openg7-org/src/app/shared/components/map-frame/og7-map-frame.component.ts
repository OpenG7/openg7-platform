import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

let gradientCounter = 0;

@Component({
  selector: 'og7-map-frame',
  standalone: true,
  templateUrl: './og7-map-frame.component.html',
  styleUrls: ['./og7-map-frame.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « shared/components/map-frame » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Og7 Map Frame ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns Og7MapFrameComponent gérée par le framework.
 */
export class Og7MapFrameComponent {
  private static readonly MAX_TILT_CAP = 18;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);
  private readonly reducedMotion =
    this.browser &&
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  @ViewChild('container', { static: true })
  private readonly container?: ElementRef<HTMLElement>;

  private _maxTilt = 6;

  protected readonly tiltTransform = signal('rotateX(0deg) rotateY(0deg)');
  protected readonly tiltActive = signal(false);
  protected readonly waveGradientId = `og7MapFrameWaveGradient${++gradientCounter}`;

  @Input()
  set maxTilt(value: number) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      this._maxTilt = 6;
      return;
    }
    const absolute = Math.abs(numeric);
    this._maxTilt = Math.max(0, Math.min(absolute, Og7MapFrameComponent.MAX_TILT_CAP));
  }

  get maxTilt(): number {
    return this._maxTilt;
  }

  protected handlePointerMove(event: PointerEvent): void {
    if (!this.browser || this.reducedMotion) {
      return;
    }

    const element = this.container?.nativeElement;
    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }

    const relativeX = (event.clientX - rect.left) / rect.width;
    const relativeY = (event.clientY - rect.top) / rect.height;

    const x = Math.min(Math.max(relativeX, 0), 1);
    const y = Math.min(Math.max(relativeY, 0), 1);

    const tiltX = (0.5 - y) * this._maxTilt * 2;
    const tiltY = (x - 0.5) * this._maxTilt * 2;

    this.tiltTransform.set(`rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`);

    if (!this.tiltActive()) {
      this.tiltActive.set(true);
    }
  }

  protected resetTilt(): void {
    this.tiltTransform.set('rotateX(0deg) rotateY(0deg)');
    if (this.tiltActive()) {
      this.tiltActive.set(false);
    }
  }
}
