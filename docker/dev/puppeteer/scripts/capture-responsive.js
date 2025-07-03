// capture-responsive.js - Capture screenshots for all responsive breakpoints and themes

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 }
];

const themes = ['light', 'dark'];

console.log(`Navigating to ${CLIENT_URL}...`);
await page.goto(CLIENT_URL, { waitUntil: 'networkidle2' });

// Wait for the app to load
await page.waitForSelector('.board-list', { timeout: 10000 });

const timestamp = Date.now();

for (const viewport of viewports) {
  console.log(`Setting viewport to ${viewport.name} (${viewport.width}x${viewport.height})`);
  await page.setViewport(viewport);
  
  for (const theme of themes) {
    console.log(`  Capturing ${theme} theme...`);
    
    // Set theme preference
    await page.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: theme }
    ]);
    
    // Give the page time to adjust to the new viewport and theme
    await page.waitForTimeout(500);
    
    // Take screenshot
    const screenshotPath = `${SCREENSHOT_DIR}/${viewport.name}_${theme}_${timestamp}.png`;
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    
    console.log(`  ✓ Saved: ${screenshotPath}`);
  }
}

console.log('All responsive screenshots captured successfully!');