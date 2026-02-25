#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://127.0.0.1:4200"
SESSION="invenet-auth-workflow"
HEADED=0
EMAIL=""
USERNAME=""
PASSWORD=""

usage() {
  cat <<USAGE
Usage:
  $(basename "$0") [options]

Options:
  --base-url URL       Base app URL (default: ${BASE_URL})
  --session NAME       Playwright CLI session name (default: ${SESSION})
  --email EMAIL        Account email (default: auto-generated)
  --username NAME      Account username (default: auto-generated)
  --password VALUE     Account password (default: auto-generated)
  --headed             Launch headed browser mode
  -h, --help           Show this help
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-url)
      BASE_URL="$2"
      shift 2
      ;;
    --session)
      SESSION="$2"
      shift 2
      ;;
    --email)
      EMAIL="$2"
      shift 2
      ;;
    --username)
      USERNAME="$2"
      shift 2
      ;;
    --password)
      PASSWORD="$2"
      shift 2
      ;;
    --headed)
      HEADED=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required. Install Node.js/npm first." >&2
  exit 1
fi

export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
PWCLI_WRAPPER="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"

if [[ -x "$PWCLI_WRAPPER" ]]; then
  PWCLI=("$PWCLI_WRAPPER")
else
  PWCLI=(npx --yes --package @playwright/cli playwright-cli)
fi

timestamp="$(date +%Y%m%d-%H%M%S)"
run_id="auth-${timestamp}"
artifact_root="output/playwright/${run_id}"
snapshot_dir="${artifact_root}/snapshots"
mkdir -p "$snapshot_dir"

random_suffix="$(date +%s | tail -c 6)"
if [[ -z "$EMAIL" ]]; then
  EMAIL="pw-${random_suffix}@example.com"
fi
if [[ -z "$USERNAME" ]]; then
  USERNAME="pwuser${random_suffix}"
fi
if [[ -z "$PASSWORD" ]]; then
  PASSWORD="Pw!${random_suffix}Strong123"
fi

headed_args=()
if [[ "$HEADED" -eq 1 ]]; then
  headed_args=(--headed)
fi

session_args=(--session "$SESSION")

run_pw() {
  local attempt=1
  local max_attempts=3

  while true; do
    if "${PWCLI[@]}" "${session_args[@]}" "$@"; then
      return 0
    fi

    if (( attempt >= max_attempts )); then
      echo "Playwright CLI command failed after ${max_attempts} attempts: $*" >&2
      return 1
    fi

    attempt=$((attempt + 1))
    sleep 1
  done
}

save_snapshot() {
  local name="$1"
  run_pw snapshot | tee "${snapshot_dir}/${name}.txt" >/dev/null
}

printf '%s\n' "run_id=${run_id}" > "${artifact_root}/run-info.txt"
printf '%s\n' "base_url=${BASE_URL}" >> "${artifact_root}/run-info.txt"
printf '%s\n' "email=${EMAIL}" >> "${artifact_root}/run-info.txt"
printf '%s\n' "username=${USERNAME}" >> "${artifact_root}/run-info.txt"
printf '%s\n' "password=${PASSWORD}" >> "${artifact_root}/run-info.txt"

# 1) Register a unique user.
run_pw open "${BASE_URL}/register" "${headed_args[@]}"
save_snapshot "01-register-open"
run_pw run-code "
  await page.getByRole('textbox', { name: 'Email' }).fill('${EMAIL}');
  await page.getByRole('textbox', { name: 'Username' }).fill('${USERNAME}');
  const passwordFields = page.locator('input[type=\"password\"]');
  await passwordFields.nth(0).fill('${PASSWORD}');
  await passwordFields.nth(1).fill('${PASSWORD}');
  await page.getByRole('button', { name: 'Create account' }).click();
"

# Registration may route to either /login or authenticated home.
run_pw run-code "
  await page.waitForLoadState('networkidle');
  const url = page.url();
  if (url.includes('/login')) {
    await page.getByRole('textbox', { name: 'Email' }).fill('${EMAIL}');
    await page.locator('input[type=\"password\"]').fill('${PASSWORD}');
    await page.getByRole('button', { name: 'Sign in' }).click();
  }
"
run_pw run-code "
  await page.waitForURL(/\/$/, { timeout: 15000 });
  await page.getByText('You\\'re signed in').waitFor({ timeout: 15000 });
"
save_snapshot "02-home-after-register"
run_pw run-code "await page.screenshot({ path: '${artifact_root}/home-after-register.png', fullPage: true });"

# 2) Sign out.
run_pw run-code "
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForURL(/\/login$/, { timeout: 15000 });
"
save_snapshot "03-login-after-signout"
run_pw run-code "await page.screenshot({ path: '${artifact_root}/login-after-signout.png', fullPage: true });"

# 3) Sign in again with same credentials.
run_pw run-code "
  await page.getByRole('textbox', { name: 'Email' }).fill('${EMAIL}');
  await page.locator('input[type=\"password\"]').fill('${PASSWORD}');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/$/, { timeout: 15000 });
  await page.getByText('You\\'re signed in').waitFor({ timeout: 15000 });
"
save_snapshot "04-home-after-login"
run_pw run-code "await page.screenshot({ path: '${artifact_root}/home-after-login.png', fullPage: true });"

run_pw close

echo "Workflow completed successfully."
echo "Artifacts: ${artifact_root}"
