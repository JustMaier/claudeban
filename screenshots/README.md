# Screenshots Directory

This directory contains screenshots captured by Puppeteer during visual testing.

## Viewing Screenshots

### For AI Agents
Use the Read tool to check if screenshots exist:
```bash
ls screenshots/
```

To view a screenshot, you'll need to:
1. Note the filename
2. Ask a human to review it, or
3. Use image analysis tools if available

### For Humans
Simply open the PNG files in any image viewer or browser.

## Naming Convention

Screenshots follow these patterns:

- **Responsive captures**: `{viewport}_{theme}_{timestamp}.png`
  - Example: `mobile_dark_1704300000000.png`

- **Interaction tests**: `{step}_{description}_{timestamp}.png`
  - Example: `01_initial_state_1704300000000.png`

- **Custom scripts**: Defined by the script author

## Cleanup

Screenshots are not committed to git. To clean up old screenshots:
```bash
rm screenshots/*.png
```