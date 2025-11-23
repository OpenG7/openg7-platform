import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@app/core/auth/auth.service';
import { OidcService } from '@app/core/auth/oidc.service';

@Component({
  standalone: true,
  selector: 'og7-auth-callback-page',
  imports: [TranslateModule],
  templateUrl: './auth-callback.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Chargée par le routeur Angular pour afficher la page « Auth Callback » du dossier « domains/auth/pages ».
 * Raison d’être : Lie le template standalone et les dépendances de cette page pour la rendre navigable.
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns AuthCallbackPage gérée par le framework.
 */
export class AuthCallbackPage implements OnInit {
  private readonly oidc = inject(OidcService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      const result = await this.oidc.handleCallback();
      this.auth.completeOidcLogin(result.auth);

      const target = result.redirectUrl || '/';
      if (/^https?:\/\//i.test(target)) {
        if (typeof window !== 'undefined') {
          window.location.assign(target);
        }
        return;
      }

      const navigated = await this.router.navigateByUrl(target, { replaceUrl: true });
      if (!navigated) {
        this.error.set(this.translate.instant('auth.errors.api'));
      }
    } catch (error) {
      this.error.set(this.resolveErrorMessage(error));
    }
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof Error && typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }

    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    return this.translate.instant('auth.errors.api');
  }
}
