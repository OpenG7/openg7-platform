import type { Signal, TemplateRef, Type } from '@angular/core';

export type Og7ModalContent = Type<unknown> | TemplateRef<unknown>;

export type Og7ModalWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface Og7ModalOptions {
  width?: Og7ModalWidth | string;
  position?: 'center' | 'top' | 'bottom';
  backdrop?: boolean;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  panelClass?: string | string[];
  backdropClass?: string | string[];
  ariaLabel?: string | null;
}

export interface Og7ModalConfig<TData = unknown, TResult = unknown> extends Og7ModalOptions {
  data?: TData;
  context?: Og7ModalTemplateContext<TResult>;
}

export type Og7ModalTemplateContext<TResult = unknown> =
  | undefined
  | null
  | (Record<string, unknown> & { $implicit?: TResult });

export interface Og7ModalState<TData = unknown, TResult = unknown> {
  readonly id: number;
  readonly content: Og7ModalContent;
  readonly options: Required<Og7ModalOptions>;
  readonly data?: TData;
  readonly context?: Og7ModalTemplateContext<TResult>;
  readonly ref: Og7ModalRef<TResult>;
}

export interface Og7ModalRef<TResult = unknown> {
  readonly id: number;
  readonly closed: Signal<boolean>;
  readonly result: Promise<TResult | undefined>;
  close(result?: TResult): void;
  dismiss(): void;
}
