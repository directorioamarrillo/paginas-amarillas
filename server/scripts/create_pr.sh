#!/usr/bin/env sh
set -e
BRANCH_NAME="auditoria/auto-changes-$(date +%Y%m%d%H%M%S)"
git checkout -b "$BRANCH_NAME"
git add -A
git commit -m "feat(auditoria): cambios completos e infra de despliegue"
git push --set-upstream origin "$BRANCH_NAME"
if command -v gh >/dev/null 2>&1; then
  gh pr create --title "feat: auditoría centralizada + infra" --body "Implementa auditoría, worker Redis, docker-compose, migraciones y frontend admin." --base main
else
  echo "Branch pushed: $BRANCH_NAME";
  echo "Install GitHub CLI (gh) to open a PR automatically: https://cli.github.com/"
fi
