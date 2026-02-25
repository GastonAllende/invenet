# Playwright CLI Workflow Script

## Script

- `scripts/playwright/run-auth-workflow.sh`

This script automates a full auth workflow against Invenet:
1. Open register page and create a unique user
2. Verify authenticated home page
3. Sign out and verify login page
4. Sign in again with the same user and verify home page

Artifacts are saved under `output/playwright/auth-<timestamp>/`.

## Run Steps

1. Start the frontend app:
   ```bash
   npx nx serve invenet
   ```

2. In another terminal, run the workflow:
   ```bash
   ./scripts/playwright/run-auth-workflow.sh --base-url http://127.0.0.1:4200 --headed
   ```

3. Optional: run with explicit credentials/session:
   ```bash
   ./scripts/playwright/run-auth-workflow.sh \
     --base-url http://127.0.0.1:4200 \
     --session invenet-auth-workflow \
     --email pw-flow@example.com \
     --username pwflow \
     --password 'Pw!Flow123Strong' \
     --headed
   ```

## Output

Each run creates:
- `run-info.txt` with URL + credentials used
- `snapshots/*.txt` after key state changes
- screenshots for register/login/home checkpoints
