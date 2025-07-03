# Docker Development Environment

This directory contains Docker configurations for the SpacetimeDB Kanban development environment, optimized for AI agents and human developers.

## Quick Start

```bash
# Start the environment
/project:start-dev-env

# Or manually
docker-compose -f docker-compose.dev.yml up -d
```

## Architecture

The environment consists of three services:

1. **spacetimedb** - SpacetimeDB server with .NET WASI support
2. **client** - Node.js development server with hot reload
3. **puppeteer** - Headless Chrome for visual testing

## Directory Structure

```
docker/
├── dev/
│   ├── spacetimedb/      # SpacetimeDB service
│   │   ├── Dockerfile
│   │   └── entrypoint.sh
│   ├── client/           # Client dev service
│   │   └── Dockerfile
│   ├── puppeteer/        # Visual testing service
│   │   ├── Dockerfile
│   │   ├── run-script.sh
│   │   └── scripts/      # Built-in test scripts
│   └── manage.sh         # Management script
└── README.md            # This file
```

## Key Features

### For AI Agents
- **No Browser Required**: Visual testing via Puppeteer screenshots
- **Error Logs**: Accessible error logs for debugging
- **Isolated Environments**: Each agent can run their own instance
- **Commands**: Claude Code commands for easy interaction

### For Humans
- **Hot Reload**: Code changes reflect immediately
- **Management Script**: `docker/dev/manage.sh` for common tasks
- **Browser Access**: Full access to UI at http://localhost:5173
- **Debugging**: Chrome DevTools at http://localhost:9222

## Visual Testing

### Built-in Scripts
- `capture-responsive.js` - Screenshots for all viewports/themes
- `test-interaction.js` - Basic user flow testing

### Custom Scripts
1. Write script in `puppeteer-scripts/`
2. Run with: `/project:test-visual custom my-script.js`
3. Screenshots saved to `screenshots/`
4. Errors logged to `puppeteer-errors/`

## Common Tasks

### Update SpacetimeDB Module
```bash
docker-compose exec spacetimedb spacetime publish --project-path /workspace/server kanban-plus
```

### Generate TypeScript Bindings
```bash
docker-compose exec client npm run db:generate
```

### View Logs
```bash
docker-compose logs -f [service-name]
```

### Access Container Shell
```bash
docker-compose exec [service-name] /bin/bash
```

## Troubleshooting

### Port Conflicts
If ports are already in use:
- SpacetimeDB: 3000, 3001
- Client: 5173
- Puppeteer: 9222

Change ports in docker-compose.dev.yml if needed.

### Service Won't Start
1. Check logs: `docker-compose logs [service]`
2. Ensure Docker is running
3. Try clean start: `docker-compose down -v && docker-compose up`

### Puppeteer Script Fails
1. Check error log in `puppeteer-errors/`
2. Common issues:
   - Selector not found
   - Timeout waiting for element
   - Navigation failed

## Development Workflow

1. **Start environment**: `/project:start-dev-env`
2. **Make changes**: Edit code in your editor
3. **Test visually**: `/project:test-visual responsive`
4. **Check results**: Review screenshots
5. **Iterate**: Fix issues and retest

## Advanced Usage

### Multiple Environments
For parallel development with worktrees:
```bash
cd ../initial-worktrees/my-feature
docker-compose -p my-feature -f ../../initial/docker-compose.dev.yml up -d
```

### Custom Puppeteer Scripts
See `puppeteer-scripts/README.md` for writing custom tests.

### Performance Tuning
- Adjust resource limits in docker-compose.dev.yml
- Use volumes for better I/O performance
- Consider using Docker BuildKit

## Maintenance

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Also remove volumes (data)
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

### Update Images
```bash
# Rebuild all images
docker-compose build --no-cache

# Update specific service
docker-compose build --no-cache [service]
```