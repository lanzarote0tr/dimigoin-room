#!/bin/bash

# --- Configuration ---
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BRANCH="main"
CHECK_INTERVAL=60
DB_DATA_PATH="./mysql_data"
WATCH_DIR="mysql/"
LOG_FILE="/tmp/auto_deploy_last_run.log" # Temp file to capture output reliably

# Fix git safety
git config --global --add safe.directory "$PROJECT_DIR"

# Ensure we have a proper terminal type for Docker output
export TERM=xterm-256color

cd "$PROJECT_DIR" || { echo "ERROR: Directory not found: $PROJECT_DIR"; exit 1; }

echo "Starting Auto-Deploy (Log Capture Mode)..."
echo "Watching branch: $BRANCH"
echo "Project Dir: $PROJECT_DIR"

# --- Helper: Detect Docker Compose Version ---
# Some systems use 'docker compose', others use 'docker-compose'
DOCKER_CMD=""
if docker compose version &>/dev/null; then
    DOCKER_CMD="docker compose"
elif command -v docker-compose &>/dev/null; then
    DOCKER_CMD="docker-compose"
else
    echo "CRITICAL ERROR: Neither 'docker compose' nor 'docker-compose' found."
    # We continue anyway to let the loop fail loudly below
    DOCKER_CMD="docker compose" 
fi
echo "Using Docker Command: $DOCKER_CMD"

# DEBUG: Verify environment
echo "--- Environment Check ---"
echo "Path: $PATH"
$DOCKER_CMD version
echo "-------------------------"

while true; do
    git fetch origin $BRANCH
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/$BRANCH)

    if [ "$LOCAL" != "$REMOTE" ]; then
        echo "------------------------------------------------"
        echo "Update detected at $(date)!"
        echo "   Local:  $LOCAL"
        echo "   Remote: $REMOTE"

        # 1. DB Logic
        if git diff --name-only "$LOCAL" "$REMOTE" | grep -q "^$WATCH_DIR"; then
            echo "ALERT: Database config changed. Wiping data..."
            $DOCKER_CMD down
            if [ -d "$DB_DATA_PATH" ]; then
                sudo rm -rf "$DB_DATA_PATH"/*
                echo "Database wiped."
            fi
        else
            echo "Database config unchanged."
        fi

        # 2. Reset Code
        echo "Pulling git changes..."
        git reset --hard origin/$BRANCH

        # 3. Build Step (Buffered to File to guarantee Journalctl capture)
        echo "------------------------------------------------"
        echo "STEP 1: Building Images..."
        echo "Command: $DOCKER_CMD build --no-cache --progress=plain"
        
        # Run build and redirect ALL output to a temp file
        # We use a file because systemd sometimes swallows piped output
        $DOCKER_CMD build --no-cache --progress=plain > "$LOG_FILE" 2>&1
        BUILD_EXIT=$?
        
        # Dump the file to stdout so Journalctl sees it
        cat "$LOG_FILE"
        
        if [ $BUILD_EXIT -eq 0 ]; then
            echo "Build Successful."
            
            # 4. Up Step
            echo "------------------------------------------------"
            echo "STEP 2: Restarting Containers..."
            
            $DOCKER_CMD up -d --force-recreate --remove-orphans > "$LOG_FILE" 2>&1
            UP_EXIT=$?
            cat "$LOG_FILE"
            
            if [ $UP_EXIT -eq 0 ]; then
                echo "SUCCESS: Containers are up."
                $DOCKER_CMD image prune -f > /dev/null 2>&1
            else
                echo "FAILURE: '$DOCKER_CMD up' failed (Exit Code: $UP_EXIT)."
            fi
        else
            echo "#######################################################"
            echo "CRITICAL FAILURE: Docker Build Failed (Exit Code: $BUILD_EXIT)"
            echo "See the output above for details."
            echo "#######################################################"
        fi

        echo "Deployment cycle finished."
    fi

    sleep $CHECK_INTERVAL
done