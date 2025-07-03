# Docker Environment Review Checklist

## Quick Test (~4 min)

### 1. Setup (1 min)
- [ ] Navigate to project: `cd /path/to/spacetimedb/initial`
- [ ] Start Docker: `docker-compose -f docker-compose.dev.yml up -d`
- [ ] Wait for "done" messages in logs

### 2. Core Functionality (1.5 min)
- [ ] Check client app: http://localhost:5173 (should see Kanban board)
- [ ] Check SpacetimeDB admin: http://localhost:3001 (should see admin interface)
- [ ] Verify you can create a board and add a card

### 3. Visual Testing (1 min)
- [ ] Run: `docker-compose exec puppeteer run-script.sh capture-responsive.js`
- [ ] Check screenshots created: `ls screenshots/` (should see 6 files)
- [ ] Files should be named like: `mobile_light_*.png`, `tablet_dark_*.png`

### 4. Error Handling (30 sec)
- [ ] Test error capture: `docker-compose exec puppeteer run-script.sh fake-script.js`
- [ ] Verify error log created: `ls puppeteer-errors/` (should see `fake-script_*.log`)

### 5. Cleanup (30 sec)
- [ ] Stop services: `docker-compose down`
- [ ] Containers should stop cleanly

## Expected Results
- **Should see**: 
  - Working Kanban app at localhost:5173
  - 6 screenshots for different viewports/themes
  - Error log when script fails
- **Should NOT see**: 
  - Port conflicts
  - Container startup failures
  - Empty screenshot directory after test

## Common Issues
- **Port already in use**: Another service using 3000, 3001, or 5173
- **Docker not running**: Start Docker Desktop/daemon first
- **Slow startup**: SpacetimeDB takes 10-20 seconds to initialize

## Next Steps
If issues found, create `TODO/FEEDBACK/docker.md` with details