import { TestBed } from '@angular/core/testing';
import { RbacFacadeService } from './rbac.facade';
import { RbacPolicyService } from './rbac.policy';

describe('RbacFacadeService', () => {
  let service: RbacFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RbacPolicyService, RbacFacadeService],
    });
    service = TestBed.inject(RbacFacadeService);
  });

  it('proxies role and permission checks', () => {
    service.setContext({ role: 'editor', isPremium: false });
    expect(service.currentRole()).toBe('editor');
    expect(service.hasPermission('write')).toBeTrue();
    expect(service.can('write')).toBeTrue();
    expect(service.canAll(['read', 'write'])).toBeTrue();
    expect(service.canAny(['premium:analytics', 'write'])).toBeTrue();
    expect(service.canAll(['premium:analytics'])).toBeFalse();
  });

  it('exposes premium permissions when enabled', () => {
    service.setContext({ role: 'visitor', isPremium: true });
    expect(service.isPremium()).toBeTrue();
    expect(service.hasPermission('premium:visibility')).toBeTrue();
    expect(service.canAny(['premium:analytics', 'read'])).toBeTrue();
  });
});
