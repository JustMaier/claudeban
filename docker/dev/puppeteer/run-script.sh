#!/bin/bash
# Usage: run-script.sh <script-name>

if [ -z "$1" ]; then
    echo "ERROR: Please provide a script name"
    echo "Usage: run-script.sh <script-name>"
    exit 1
fi

SCRIPT_NAME=$1
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ERROR_LOG="${ERROR_LOG_DIR}/${SCRIPT_NAME%.js}_${TIMESTAMP}.log"

# Check if script exists
SCRIPT_PATH="/scripts/${SCRIPT_NAME}"
if [ ! -f "$SCRIPT_PATH" ]; then
    # Try built-in scripts
    SCRIPT_PATH="/built-in-scripts/${SCRIPT_NAME}"
    if [ ! -f "$SCRIPT_PATH" ]; then
        echo "ERROR: Script not found: ${SCRIPT_NAME}"
        echo "Checked: /scripts/${SCRIPT_NAME} and /built-in-scripts/${SCRIPT_NAME}"
        exit 1
    fi
fi

echo "Running Puppeteer script: ${SCRIPT_NAME}"
echo "Screenshots will be saved to: ${SCREENSHOT_DIR}"
echo "Error log (if any): ${ERROR_LOG}"

# Create a wrapper script that includes Puppeteer setup
cat > /tmp/wrapper.js << EOF
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],
        executablePath: '/usr/bin/google-chrome-stable'
    });

    try {
        // Make browser and common variables available to the script
        global.browser = browser;
        global.CLIENT_URL = process.env.CLIENT_URL || 'http://client:5173';
        global.SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || '/screenshots';
        
        // Execute the user script
        const scriptContent = require('fs').readFileSync('${SCRIPT_PATH}', 'utf8');
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const userScript = new AsyncFunction('browser', 'page', scriptContent);
        
        const page = await browser.newPage();
        await userScript(browser, page);
        
        console.log('Script completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Script error:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
EOF

# Run the wrapper script, capture output
node /tmp/wrapper.js 2>&1 | tee "${ERROR_LOG}"

# Check exit status
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    rm -f "${ERROR_LOG}"
    echo "SUCCESS: Script completed without errors"
    
    # List generated screenshots
    echo "Generated screenshots:"
    ls -la ${SCREENSHOT_DIR}/*.png 2>/dev/null || echo "No screenshots found"
else
    echo "ERROR: Script failed. Check log at: ${ERROR_LOG}"
    echo "Error log contents:"
    cat "${ERROR_LOG}"
    exit 1
fi