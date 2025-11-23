import { Injectable, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
/**
 * Contexte : Injecté via Angular DI par les autres briques du dossier « core/security ».
 * Raison d’être : Centralise la logique métier et les appels nécessaires autour de « Dom Sanitizer ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns DomSanitizerService gérée par le framework.
 */
export class DomSanitizerService {
  private sanitizer = inject(DomSanitizer);

  /**
   * Contexte : Called by rich-text components before projecting CMS HTML into the DOM.
   * Raison d’être : Delegates sanitisation to Angular’s DomSanitizer while guaranteeing a string fallback.
   * @param html Raw HTML snippet coming from untrusted sources such as CMS entries.
   * @returns A sanitised string safe to bind into innerHTML.
   */
  sanitizeHtml(html: string): string {
    return this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }
}
