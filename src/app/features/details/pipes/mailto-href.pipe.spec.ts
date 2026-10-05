import { MailtoHrefPipe } from './mailto-href.pipe';

describe('MailtoHrefPipe', () => {
  it('builds a mailto link', () => {
    expect(new MailtoHrefPipe().transform('support@current.eco')).toBe(
      'mailto:support@current.eco',
    );
  });
});
