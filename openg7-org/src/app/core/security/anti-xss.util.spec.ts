import { escapeHtml } from './anti-xss.util';

describe('escapeHtml', () => {
  it('escapes dangerous characters', () => {
    const input = "<script>alert('xss')</script>&\"";
    expect(escapeHtml(input)).toBe('&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;&amp;&quot;');
  });

  it('returns the original string when no escaping is required', () => {
    const input = 'safe text';
    expect(escapeHtml(input)).toBe('safe text');
  });
});
