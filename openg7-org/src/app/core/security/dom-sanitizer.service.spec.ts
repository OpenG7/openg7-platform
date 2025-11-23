import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { DomSanitizerService } from './dom-sanitizer.service';

describe('DomSanitizerService', () => {
  let service: DomSanitizerService;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DomSanitizerService],
    });
    service = TestBed.inject(DomSanitizerService);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('returns sanitized HTML or empty string', () => {
    const malicious = '<img src=x onerror="alert(1)"><p>content</p>';
    const sanitized = service.sanitizeHtml(malicious);
    const expected = sanitizer.sanitize(SecurityContext.HTML, malicious) ?? '';
    expect(sanitized).toBe(expected);
  });

  it('coalesces nullish sanitizer results to empty string', () => {
    spyOn(sanitizer, 'sanitize').and.returnValue(null);
    expect(service.sanitizeHtml('<div>test</div>')).toBe('');
  });
});
