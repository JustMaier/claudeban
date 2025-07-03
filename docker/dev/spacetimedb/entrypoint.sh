#!/bin/bash
set -e

echo "Starting SpacetimeDB development environment..."

# Function to build and publish module
publish_module() {
    echo "Building and publishing SpacetimeDB module..."
    cd /workspace
    if spacetime publish --project-path server ${SPACETIME_MODULE_NAME} --clear-database; then
        echo "Module published successfully"
    else
        echo "Warning: Module publish failed, will retry..."
        sleep 5
        spacetime publish --project-path server ${SPACETIME_MODULE_NAME} --clear-database || true
    fi
}

# Start SpacetimeDB in the background
echo "Starting SpacetimeDB server..."
spacetime start ${SPACETIME_MODULE_NAME} &
SPACETIME_PID=$!

# Wait for SpacetimeDB to be ready
echo "Waiting for SpacetimeDB to be ready..."
sleep 10

# Initial module publish
publish_module

# Watch for changes and republish (optional, can be triggered manually)
echo "SpacetimeDB is ready. Module: ${SPACETIME_MODULE_NAME}"
echo "To update the module, run: docker-compose exec spacetimedb spacetime publish --project-path /workspace/server ${SPACETIME_MODULE_NAME}"

# Keep the container running
wait $SPACETIME_PID