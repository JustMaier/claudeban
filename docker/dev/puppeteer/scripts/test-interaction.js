// test-interaction.js - Test basic interactions and capture screenshots

console.log(`Navigating to ${CLIENT_URL}...`);
await page.goto(CLIENT_URL, { waitUntil: 'networkidle2' });

// Wait for the app to load
await page.waitForSelector('.board-list', { timeout: 10000 });

const timestamp = Date.now();

// Step 1: Capture initial state
console.log('Capturing initial state...');
await page.screenshot({
  path: `${SCREENSHOT_DIR}/01_initial_state_${timestamp}.png`,
  fullPage: true
});

// Step 2: Set user name
console.log('Setting user name...');
const userInput = await page.$('input[placeholder="Enter your name"]');
if (userInput) {
  await userInput.type('Test User');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/02_user_name_set_${timestamp}.png`,
    fullPage: true
  });
}

// Step 3: Create a new board
console.log('Creating a new board...');
await page.type('input[placeholder="Board slug"]', `test-board-${timestamp}`);
await page.type('input[placeholder="Board title"]', 'Test Board');
await page.click('button:has-text("Create Board")');
await page.waitForTimeout(2000);

await page.screenshot({
  path: `${SCREENSHOT_DIR}/03_board_created_${timestamp}.png`,
  fullPage: true
});

// Step 4: Add a card (if board creation was successful)
const newCardInput = await page.$('input[placeholder="New card title"]');
if (newCardInput) {
  console.log('Adding a card...');
  await newCardInput.type('Test Card');
  await page.click('button:has-text("Add Card")');
  await page.waitForTimeout(1000);
  
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/04_card_added_${timestamp}.png`,
    fullPage: true
  });
}

// Step 5: Open another tab to test real-time sync
console.log('Testing real-time sync...');
const page2 = await browser.newPage();
await page2.goto(CLIENT_URL, { waitUntil: 'networkidle2' });
await page2.waitForSelector('.board-list', { timeout: 10000 });

// Set viewport for side-by-side comparison
await page.setViewport({ width: 960, height: 1080 });
await page2.setViewport({ width: 960, height: 1080 });

// Capture both pages
await page.screenshot({
  path: `${SCREENSHOT_DIR}/05_sync_page1_${timestamp}.png`
});
await page2.screenshot({
  path: `${SCREENSHOT_DIR}/05_sync_page2_${timestamp}.png`
});

await page2.close();

console.log('Interaction test completed successfully!');