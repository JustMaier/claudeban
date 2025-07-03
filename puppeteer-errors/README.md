# Puppeteer Error Logs

This directory contains error logs from failed Puppeteer script executions.

## Error Log Format

Error logs are named: `{script_name}_{timestamp}.log`

Example: `test-theme-switcher_20240103_143022.log`

## For AI Agents

When a Puppeteer script fails:

1. The error log location will be shown in the output
2. Read the error log:
   ```bash
   cat puppeteer-errors/test-theme-switcher_20240103_143022.log
   ```

3. Common errors and solutions:
   - **Timeout waiting for selector**: Element not found, check selector
   - **Navigation timeout**: Page took too long to load
   - **Click intercepted**: Element is covered by another element

4. After fixing the issue, clean up the error log:
   ```bash
   rm puppeteer-errors/test-theme-switcher_20240103_143022.log
   ```

## For Humans

Error logs contain:
- Full stack trace
- Console output from the script
- Chrome browser errors (if any)

To view all recent errors:
```bash
ls -la puppeteer-errors/
```