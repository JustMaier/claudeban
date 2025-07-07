# Test Visual Changes

Run Puppeteer scripts to capture screenshots and test visual changes.

## Usage
/project:test-visual [option] [script-name]

Options:
- `responsive` - Capture all viewport/theme combinations
- `interaction` - Test basic user interactions
- `custom <script>` - Run a custom script

## Instructions

1. **Verify Environment**
   - Check if Docker environment is running:
   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```
   - If not running, suggest: `/project:start-dev-env`

2. **Based on Option**

   ### Option: responsive
   ```bash
   docker-compose exec puppeteer run-script.sh capture-responsive.js
   ```
   - Captures 6 screenshots (3 viewports × 2 themes)
   - Shows output and lists generated files

   ### Option: interaction  
   ```bash
   docker-compose exec puppeteer run-script.sh test-interaction.js
   ```
   - Runs through basic user flow
   - Captures screenshots at each step
   - Tests real-time sync

   ### Option: custom
   - Extract script name from $ARGUMENTS
   - Check if script exists:
   ```bash
   ls .claude/testing/puppeteer/${SCRIPT_NAME}
   ```
   - If not, show error and list available scripts
   - Run the script:
   ```bash
   docker-compose exec puppeteer run-script.sh ${SCRIPT_NAME}
   ```

3. **Handle Output**
   - If successful:
     - List generated screenshots: `ls -la .claude/testing/screenshots/*.png`
     - Show success message
   - If failed:
     - Extract error log path from output
     - Show error log location
     - Suggest reading error log

4. **Provide Next Steps**
   ```
   ✅ Visual test completed!
   
   📸 Screenshots saved to: .claude/testing/screenshots/
   Generated files:
   [list files]
   
   To view screenshots:
   - For humans: Open .claude/testing/screenshots/*.png in image viewer
   - For agents: Note filenames for reference
   
   To analyze errors (if any):
   cat .claude/testing/errors/[error-log-name]
   ```

5. **Common Issues**
   - Script not found: List available scripts
   - Timeout errors: Suggest increasing wait times
   - Selector not found: Check if app structure changed

## Examples

```bash
# Capture all responsive views
/project:test-visual responsive

# Test interactions
/project:test-visual interaction

# Run custom script
/project:test-visual custom test-theme-switcher.js
```