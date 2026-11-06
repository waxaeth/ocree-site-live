const test = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const {runInNewContext} = require('node:vm');

const root = join(__dirname, '..');
const source = readFileSync(join(root, 'i18n.js'), 'utf8').split('let currentLanguage')[0];
const french = runInNewContext(`${source}\nfr`);

test('current shared navigation, footer, and form copy has French translations', () => {
  for (const english of [
    'Solutions', 'Dealers and advisors', 'Investors', 'Contact',
    'Your connection to private markets', 'Conflicts of Interest', 'Account Agreement',
    'Manage cookies', 'Decline all', 'Accept all', 'Sending...',
    "Thanks. We'll be in touch soon."
  ]) {
    assert.ok(french[english], `Missing French translation: ${english}`);
  }
});

test('current page headlines and updated copy have French translations', () => {
  const pages = [
    ['index.html', 'Your connection to private markets'],
    ['platform.html', 'Issuers, counsel, dealers and advisors keep their roles. Ocree provides one process for diligence, issuance, distribution and reporting.'],
    ['asset-owners.html', 'A path to raise capital through registered dealers.'],
    ['investors.html', 'Speak with your existing dealer.'],
    ['resources.html', 'Keep up with private markets'],
    ['contact.html', 'Talk to our team']
  ];
  for (const [page, english] of pages) {
    assert.ok(readFileSync(join(root, page), 'utf8').includes(english), `${page} copy changed; update this test`);
    assert.notEqual(french[english], english, `Missing French translation: ${english}`);
  }
});
