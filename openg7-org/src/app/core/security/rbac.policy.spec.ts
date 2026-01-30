import { TestBed } from '@angular/core/testing';

import { RbacPolicyService } from './rbac.policy';

describe('RbacPolicyService', () => {
  let service: RbacPolicyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RbacPolicyService],
    });
    service = TestBed.inject(RbacPolicyService);
  });

  it('defaults to visitor permissions', () => {
    expect(service.currentRole()).toBe('visitor');
    expect(service.permissions()).toEqual(['read']);
    expect(service.hasPermission('read')).toBeTrue();
    expect(service.hasPermission('write')).toBeFalse();
  });

  it('updates role and premium context idempotently', () => {
    service.setContext({ role: 'editor', isPremium: true });
    service.setContext({ role: 'editor', isPremium: true });
    expect(service.currentRole()).toBe('editor');
    expect(service.permissions()).toContain('write');
    expect(service.permissions()).toContain('premium:visibility');
    expect(service.hasPermission('premium:analytics')).toBeTrue();
  });

  it('treats admin role as wildcard', () => {
    service.setRole('admin');
    expect(service.hasPermission('write')).toBeTrue();
    expect(service.hasPermission('non-existent')).toBeTrue();
  });
});
