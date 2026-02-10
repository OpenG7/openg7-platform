import { TestBed } from '@angular/core/testing';
import { Route, UrlSegment } from '@angular/router';

import { RbacFacadeService } from '../security/rbac.facade';

import { isAllowedSig, reasonSig, roleGuard } from './role.guard';

interface RbacFacadeStub {
  currentRole: jasmine.Spy<() => 'visitor' | 'editor' | 'admin'>;
}

describe('roleGuard', () => {
  let rbac: RbacFacadeStub;
  const segments = [new UrlSegment('pro', {})];

  beforeEach(() => {
    rbac = {
      currentRole: jasmine.createSpy('currentRole').and.returnValue('visitor'),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: RbacFacadeService, useValue: rbac as unknown as RbacFacadeService }],
    });

    isAllowedSig.set(false);
    reasonSig.set(null);
  });

  it('allows navigation when no expected roles are configured', () => {
    const allowed = TestBed.runInInjectionContext(() => roleGuard({} as Route, segments));

    expect(allowed).toBeTrue();
    expect(rbac.currentRole).not.toHaveBeenCalled();
    expect(isAllowedSig()).toBeTrue();
    expect(reasonSig()).toBeNull();
  });

  it('allows navigation when current role is in the expected list', () => {
    rbac.currentRole.and.returnValue('editor');
    const route = { data: { roles: ['editor', 'admin'] } } as Route;

    const allowed = TestBed.runInInjectionContext(() => roleGuard(route, segments));

    expect(allowed).toBeTrue();
    expect(rbac.currentRole).toHaveBeenCalled();
    expect(isAllowedSig()).toBeTrue();
    expect(reasonSig()).toBeNull();
  });

  it('blocks navigation when current role is not expected', () => {
    rbac.currentRole.and.returnValue('visitor');
    const route = { data: { roles: ['editor', 'admin'] } } as Route;

    const allowed = TestBed.runInInjectionContext(() => roleGuard(route, segments));

    expect(allowed).toBeFalse();
    expect(rbac.currentRole).toHaveBeenCalled();
    expect(isAllowedSig()).toBeFalse();
    expect(reasonSig()).toBe('role.forbidden');
  });
});
