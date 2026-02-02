import { CommonModule, NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Injector,
  TemplateRef,
  Type,
  inject,
} from '@angular/core';

import { Og7ModalService } from './og7-modal.service';
import { Og7ModalState } from './og7-modal.types';

@Component({
  selector: 'og7-modal-container',
  standalone: true,
  imports: [CommonModule, NgComponentOutlet, NgTemplateOutlet],
  templateUrl: './og7-modal-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Contexte : Affichée dans les vues du dossier « core/ui/modal » en tant que composant Angular standalone.
 * Raison d’être : Encapsule l'interface utilisateur et la logique propre à « Og7 Modal Container ».
 * @param dependencies Dépendances injectées automatiquement par Angular.
 * @returns Og7ModalContainerComponent gérée par le framework.
 */
export class Og7ModalContainerComponent {
  private readonly modalService = inject(Og7ModalService);
  private readonly injector = inject(Injector);

  readonly modal = this.modalService.state;

  /**
   * Contexte : Bound to the global escape keydown event while the modal is open.
   * Raison d’être : Dismisses the modal when ESC is pressed and the option is enabled.
   * @param event Keyboard event emitted by the document listener.
   * @returns void
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }
    const state = this.modal();
    if (!state?.options.closeOnEsc) {
      return;
    }
    event.preventDefault();
    this.modalService.dismiss();
  }

  /**
   * Contexte : Used by the template to determine whether the modal content is a TemplateRef.
   * Raison d’être : Enables rendering template content with NgTemplateOutlet when applicable.
   * @param state Current modal state.
   * @returns Template reference or null.
   */
  asTemplate(state: Og7ModalState): TemplateRef<unknown> | null {
    return state.content instanceof TemplateRef ? state.content : null;
  }

  /**
   * Contexte : Used by the template to determine whether the modal content is a component type.
   * Raison d’être : Allows projecting dynamic components via NgComponentOutlet.
   * @param state Current modal state.
   * @returns Component type or null when content is a template.
   */
  asComponent(state: Og7ModalState): Type<unknown> | null {
    return state.content instanceof TemplateRef ? null : (state.content as Type<unknown>);
  }

  /**
   * Contexte : Called from the template to compute flex alignment classes based on modal options.
   * Raison d’être : Applies consistent positioning for top, bottom or centered modals.
   * @param state Current modal state.
   * @returns CSS class string controlling container alignment.
   */
  positionClasses(state: Og7ModalState): string {
    switch (state.options.position) {
      case 'top':
        return 'items-start justify-center';
      case 'bottom':
        return 'items-end justify-center';
      default:
        return 'items-center justify-center';
    }
  }

  /**
   * Contexte : Builds the CSS class list applied to the modal panel element.
   * Raison d’être : Combines base styling with width presets and optional custom classes.
   * @param state Current modal state.
   * @returns Array of classes assigned to the panel.
   */
  panelClasses(state: Og7ModalState): string[] {
    const widthClass = this.widthClass(state);
    const base = [
      'mx-auto',
      'max-h-[90vh]',
      'overflow-y-auto',
      'rounded-2xl',
      'bg-surface',
      'p-6',
      'shadow-xl',
      'ring-1',
      'ring-slate-900/10',
    ];

    const panel = state.options.panelClass;
    if (Array.isArray(panel)) {
      return [...base, widthClass, ...panel.filter(Boolean)];
    }

    if (panel) {
      return [...base, widthClass, panel];
    }

    return [...base, widthClass];
  }

  /**
   * Contexte : Provides inline styles for custom width values beyond the predefined presets.
   * Raison d’être : Allows arbitrary CSS widths configured via modal options.
   * @param state Current modal state.
   * @returns Style map when a custom width is provided.
   */
  panelStyles(state: Og7ModalState): Record<string, string> | null {
    const width = state.options.width;
    if (typeof width === 'string' && !['sm', 'md', 'lg', 'xl', 'full'].includes(width)) {
      return { width };
    }
    return null;
  }

  /**
   * Contexte : Determines the backdrop class list injected into the overlay element.
   * Raison d’être : Supports default styling while honouring custom overrides.
   * @param state Current modal state.
   * @returns Array of backdrop classes.
   */
  backdropClasses(state: Og7ModalState): string[] {
    const base = ['bg-slate-900/60'];
    const custom = state.options.backdropClass;
    if (Array.isArray(custom)) {
      return custom.length ? custom : base;
    }
    if (typeof custom === 'string' && custom.length) {
      return [custom];
    }
    return base;
  }

  /**
   * Contexte : Used by the template to create an injector for dynamic content components/templates.
   * Raison d’être : Passes modal data and reference tokens down to projected content.
   * @param state Current modal state.
   * @returns Injector bound to the modal scope.
   */
  childInjector(state: Og7ModalState): Injector {
    return this.modalService.createContentInjector(state, this.injector);
  }

  /**
   * Contexte : Handles clicks on the backdrop overlay.
   * Raison d’être : Dismisses the modal when allowed by configuration.
   * @param state Current modal state.
   * @returns void
   */
  onBackdrop(state: Og7ModalState): void {
    if (!state.options.closeOnBackdrop) {
      return;
    }
    this.modalService.dismiss();
  }

  /**
   * Contexte : Handles clicks on the container outside the modal panel.
   * Raison d’être : Mirrors backdrop behaviour for pointer events that bubble from the container wrapper.
   * @param state Current modal state.
   * @returns void
   */
  onContainerClick(state: Og7ModalState): void {
    if (!state.options.closeOnBackdrop) {
      return;
    }
    this.modalService.dismiss();
  }

  private widthClass(state: Og7ModalState): string {
    const width = state.options.width;
    switch (width) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-[min(90vw,70rem)]';
      default:
        return 'max-w-full';
    }
  }
}
