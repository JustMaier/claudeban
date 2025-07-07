# Write Visual Test

Helper command to create custom Puppeteer test scripts.

## Usage
/project:write-visual-test $ARGUMENTS

Where $ARGUMENTS describes what to test (e.g., "theme switcher functionality")

## Instructions

1. **Parse Test Requirements**
   - Extract what the user wants to test from $ARGUMENTS
   - Identify key interactions and checkpoints

2. **Generate Script Structure**
   Based on the requirements, create a Puppeteer script with:
   - Descriptive filename (e.g., `test-theme-switcher.js`)
   - Clear console.log messages
   - Screenshot captures at key points
   - Error handling

3. **Write Script to File**
   ```javascript
   // Example template
   console.log('Testing: [DESCRIPTION]');
   
   // Navigate to app
   await page.goto(CLIENT_URL);
   await page.waitForSelector('.board-list', { timeout: 10000 });
   
   // Step 1: [First action]
   console.log('Step 1: [Description]');
   // [Interaction code]
   await page.screenshot({
     path: `${SCREENSHOT_DIR}/01_[description]_${Date.now()}.png`
   });
   
   // Step 2: [Second action]
   // ... continue pattern
   
   console.log('Test completed successfully!');
   ```

4. **Save Script**
   - Save to: `.claude/testing/puppeteer/[script-name].js`
   - Show the created filename

5. **Provide Usage Instructions**
   ```
   ✅ Visual test script created!
   
   📄 Script: puppeteer-scripts/[script-name].js
   
   To run the test:
   /project:test-visual custom [script-name].js
   
   To edit the script:
   - Open puppeteer-scripts/[script-name].js
   - Modify as needed
   - Available variables:
     - browser, page (Puppeteer objects)
     - CLIENT_URL (http://client:5173)
     - SCREENSHOT_DIR (/screenshots)
   ```

## Example Templates

### Testing a Button Click
```javascript
await page.click('.my-button');
await page.waitForTimeout(500);
await page.screenshot({
  path: `${SCREENSHOT_DIR}/button_clicked.png`
});
```

### Testing Form Input
```javascript
await page.type('input[name="username"]', 'testuser');
await page.click('button[type="submit"]');
await page.waitForSelector('.success-message');
```

### Testing Navigation
```javascript
await page.click('a[href="/about"]');
await page.waitForNavigation();
assert(page.url().includes('/about'));
```

### Testing Responsive Behavior
```javascript
// Mobile view
await page.setViewport({ width: 375, height: 667 });
await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile.png` });

// Desktop view  
await page.setViewport({ width: 1920, height: 1080 });
await page.screenshot({ path: `${SCREENSHOT_DIR}/desktop.png` });
```