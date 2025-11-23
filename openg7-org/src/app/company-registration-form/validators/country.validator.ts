import { AbstractControl, ValidationErrors } from '@angular/forms';

export function isoCountryValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string | null | undefined;
  if (!value) {
    return null;
  }
  return /^[A-Z]{2}$/.test(value) ? null : { isoCountry: true };
}
