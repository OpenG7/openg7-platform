import { AbstractControl, ValidationErrors } from '@angular/forms';

export function caPhoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value as string | null | undefined)?.trim();
  if (!value) {
    return null;
  }

  const digits = value.replace(/\D+/g, '');
  if (digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))) {
    return null;
  }
  return { caPhone: true };
}
