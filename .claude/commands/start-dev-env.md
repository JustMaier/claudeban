# Start Development Environment

Starts the Docker-based development environment with SpacetimeDB, client, and Puppeteer services.

## Usage
/project:start-dev-env

## Instructions

1. **Check Docker Status**
   ```bash
   docker --version
   ```
   - If not installed, inform user to install Docker

2. **Check Current Directory**
   - Ensure we're in the project root (where docker-compose.dev.yml exists)
   - If in a worktree, note that each worktree can have its own environment

3. **Start Services**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```
   - Use `-d` for detached mode
   - If in worktree, use unique project name: `-p agent-[feature]`

4. **Wait for Services**
   - Check health status:
   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```
   - Wait for all services to be "healthy" or "running"

5. **Verify Services**
   - SpacetimeDB: `curl -s http://localhost:3001/health || echo "SpacetimeDB starting..."`
   - Client: `curl -s http://localhost:5173 || echo "Client starting..."`
   - Show logs if any service fails to start

6. **Display Access Information**
   ```
   ✅ Development environment started!
   
   📍 Service URLs:
   - Client: http://localhost:5173
   - SpacetimeDB WebSocket: ws://localhost:3000/kanban-plus
   - SpacetimeDB Admin: http://localhost:3001
   
   🛠️ Common commands:
   - View logs: docker-compose logs -f [service]
   - Update DB: docker-compose exec spacetimedb spacetime publish --project-path /workspace/server kanban-plus
   - Run Puppeteer: docker-compose exec puppeteer run-script.sh [script]
   - Stop all: docker-compose down
   ```

7. **Troubleshooting**
   If any service fails:
   - Show relevant logs: `docker-compose logs [service]`
   - Common issues:
     - Port already in use
     - Docker not running
     - Insufficient permissions