import { chromium } from 'playwright';

(async () => {
  const base = 'http://127.0.0.1:4321';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to login page...');
    await page.goto(base + '/iniciar-sesion', { waitUntil: 'domcontentloaded', timeout: 10000 });

    // Fill form fields (names based on component)
    await page.fill('input[name="correo"]', 'admin@paginas360.com');
    await page.fill('input[name="password"]', 'cualquier');

    // Capture console messages
    page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));

    console.log('Submitting form...');
    await Promise.all([
      page.waitForNavigation({ timeout: 5000 }).catch(e => null),
      page.click('button[type="submit"]'),
    ]);

    const url = page.url();
    console.log('After submit URL:', url);

    if (url.endsWith('/') || url === base + '/') {
      console.log('Test PASSED: redirected to / (demo or real login)');
      process.exit(0);
    } else {
      console.log('Test FAILED: not redirected. Current URL:', url);
      // Try to capture visible error text
      const errEl = await page.$('.error-form');
      if (errEl) {
        const txt = await errEl.textContent();
        console.log('Visible error-form text:', txt?.trim());
      }
      process.exit(2);
    }
  } catch (err) {
    console.error('Test ERROR:', err);
    process.exit(3);
  } finally {
    await browser.close();
  }
})();
