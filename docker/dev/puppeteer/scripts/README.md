# Built-in Puppeteer Scripts

This directory contains pre-built Puppeteer scripts for common testing scenarios.

## Available Scripts

### capture-responsive.js
Captures screenshots for all responsive breakpoints and color themes.

**Output:**
- `mobile_light_[timestamp].png`
- `mobile_dark_[timestamp].png`
- `tablet_light_[timestamp].png`
- `tablet_dark_[timestamp].png`
- `desktop_light_[timestamp].png`
- `desktop_dark_[timestamp].png`

### test-interaction.js
Tests basic user interactions and captures screenshots at each step.

**Steps:**
1. Initial page load
2. Set user name
3. Create a board
4. Add a card
5. Test real-time sync with second browser

## Writing Custom Scripts

When writing custom Puppeteer scripts, you have access to:

- `browser` - The Puppeteer browser instance
- `page` - A pre-created page object
- `CLIENT_URL` - The client application URL (default: http://client:5173)
- `SCREENSHOT_DIR` - Directory for saving screenshots (/screenshots)

### Example Custom Script

```javascript
// custom-test.js
// Navigate to the app
await page.goto(CLIENT_URL);

// Wait for an element
await page.waitForSelector('.board-list');

// Interact with the page
await page.click('button.create-board');

// Take a screenshot
await page.screenshot({
  path: `${SCREENSHOT_DIR}/custom_test.png`
});

// Use console.log for output
console.log('Custom test completed!');
```

## Tips

1. Always use `console.log()` for progress messages
2. Use meaningful screenshot names with timestamps
3. Add `waitForTimeout()` after interactions to let the UI update
4. Handle errors gracefully with try-catch blocks
5. Close any extra pages/browsers you create