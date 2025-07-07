# Custom Puppeteer Scripts

This directory is for custom Puppeteer scripts written by agents or developers.

## Writing a Custom Script

Create a new `.js` file in this directory. Your script will have access to:

- `browser` - Puppeteer browser instance
- `page` - Pre-created page object  
- `CLIENT_URL` - The app URL (http://client:5173)
- `SCREENSHOT_DIR` - Where to save screenshots (/screenshots)

## Example Script

```javascript
// test-my-feature.js
console.log('Testing my new feature...');

// Navigate to app
await page.goto(CLIENT_URL);
await page.waitForSelector('.board-list');

// Your test logic here
await page.click('.my-button');

// Capture result
await page.screenshot({
  path: `${SCREENSHOT_DIR}/my_feature_test.png`
});

console.log('Test completed!');
```

## Running Your Script

From the project root:
```bash
docker-compose exec puppeteer run-script.sh test-my-feature.js
```

## Best Practices

1. Use descriptive console.log messages
2. Add waitForTimeout() after actions
3. Use try-catch for error handling
4. Include timestamps in screenshot names
5. Clean up resources (close extra pages)

## Available Built-in Scripts

See `/docker/dev/puppeteer/scripts/` for examples:
- `capture-responsive.js` - All viewports/themes
- `test-interaction.js` - Basic user flow