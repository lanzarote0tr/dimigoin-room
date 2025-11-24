#!/bin/bash

# --- Configuration ---
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BRANCH="main"
CHECK_INTERVAL=60

# IMPORTANT: The path to the ACTUAL database files on the host
# This is the folder mapped in volumes (e.g., - ./mysql_data:/var/lib/mysql)
# CAUTION: This folder gets DELETED if the mysql config changes!
DB_DATA_PATH="./mysql_data"

# The directory in the GIT REPO to watch for config changes
WATCH_DIR="mysql/"

# FIX: Trust the directory. 
# Since this runs as root (via systemd) but the files are owned by your user,
# Git blocks access unless we explicitly whitelist this path.
git config --global --add safe.directory "$PROJECT_DIR"

cd "$PROJECT_DIR" || { echo "Directory not found: $PROJECT_DIR"; exit 1; }

echo "Starting Auto-Deploy with Smart DB Refresh..."
echo "Watching branch: $BRANCH"

while true; do
    git fetch origin $BRANCH
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/$BRANCH)

    if [ "$LOCAL" != "$REMOTE" ]; then
        echo "------------------------------------------------"
        echo "Update detected!"

        # 1. Check if the /mysql directory is in the list of changed files
        # We do this BEFORE git reset so we can see the diff
        if git diff --name-only "$LOCAL" "$REMOTE" | grep -q "^$WATCH_DIR"; then
            echo "ALERT: Changes detected in '$WATCH_DIR'. Triggering Fresh Database..."
            
            # Stop containers first so we can delete files safely
            docker compose down

            # WIPE the database data
            if [ -d "$DB_DATA_PATH" ]; then
                echo "Removing old database data at $DB_DATA_PATH..."
                sudo rm -rf "$DB_DATA_PATH"/*
                # OR if you use named volumes instead of host paths:
                # docker volume rm project_db_data
            else
                echo "Warning: Data path $DB_DATA_PATH not found, skipping wipe."
            fi
            
            FRESH_DB=true
        else
            echo "Database config unchanged. Preserving data."
            FRESH_DB=false
        fi

        # 2. Pull the code
        echo "Pulling git changes..."
        git reset --hard origin/$BRANCH

        # 3. Rebuild and Start
        # We use --no-cache to ensure code recompiles
        echo "Rebuilding containers..."
        docker compose up -d --build --force-recreate --no-cache --remove-orphans

        echo "Deployment complete."
    fi

    sleep $CHECK_INTERVAL
done