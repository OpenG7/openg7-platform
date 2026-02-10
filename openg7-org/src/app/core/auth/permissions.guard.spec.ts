import { TestBed } from '@angular/core/testing';
import { Route, UrlSegment } from '@angular/router';

import { RbacFacadeService } from '../security/rbac.facade';

import { isAllowedSig, permissionsGuard, reasonSig } from './permissions.guard';

interface RbacFacadeStub {
  hasPermission: jasmine.Spy<(permission: string) => boolean>;
}

describe('permissionsGuard', () => {
  let rbac: RbacFacadeStub;
  const segments = [new UrlSegment('pro', {})];

  beforeEach(() => {
    rbac = {
      hasPermission: jasmine.createSpy('hasPermission').and.returnValue(false),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: RbacFacadeService, useValue: rbac as unknown as RbacFacadeService }],
    });

    isAllowedSig.set(false);
    reasonSig.set(null);
  });

  it('allows navigation when no permissions are configured', () => {
    const allowed = TestBed.runInInjectionContext(() =>
      permissionsGuard({} as Route, segments)
    );

    expect(allowed).toBeTrue();
    expect(rbac.hasPermission).not.toHaveBeenCalled();
    expect(isAllowedSig()).toBeTrue();
    expect(reasonSig()).toBeNull();
  });

  it('allows navigation when every required permission is granted', () => {
    rbac.hasPermission.and.returnValue(true);
    const route = { data: { permissions: ['write', 'premium:analytics'] } } as Route;

    const allowed = TestBed.runInInjectionContext(() => permissionsGuard(route, segments));

    expect(allowed).toBeTrue();
    expect(rbac.hasPermission).toHaveBeenCalledWith('write');
    expect(rbac.hasPermission).toHaveBeenCalledWith('premium:analytics');
    expect(isAllowedSig()).toBeTrue();
    expect(reasonSig()).toBeNull();
  });

  it('blocks navigation when at least one permission is missing', () => {
    rbac.hasPermission.and.callFake((permission: string) => permission !== 'write');
    const route = { data: { permissions: ['read', 'write'] } } as Route;

    const allowed = TestBed.runInInjectionContext(() => permissionsGuard(route, segments));

    expect(allowed).toBeFalse();
    expect(rbac.hasPermission).toHaveBeenCalledWith('read');
    expect(rbac.hasPermission).toHaveBeenCalledWith('write');
    expect(isAllowedSig()).toBeFalse();
    expect(reasonSig()).toBe('permission.forbidden');
  });
});
