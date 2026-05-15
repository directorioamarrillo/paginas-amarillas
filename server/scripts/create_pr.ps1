param(
  [string]$Base = 'main'
)
$branch = "auditoria/auto-changes-$(Get-Date -Format yyyyMMddHHmmss)"
git checkout -b $branch
git add -A
git commit -m 'feat(auditoria): cambios completos e infra de despliegue'
git push --set-upstream origin $branch
if (Get-Command gh -ErrorAction SilentlyContinue) {
  gh pr create --title 'feat: auditoría centralizada + infra' --body 'Implementa auditoría, worker Redis, docker-compose, migraciones y frontend admin.' --base $Base
} else {
  Write-Host "Branch pushed: $branch"
  Write-Host "Install GitHub CLI (gh) to open a PR automatically: https://cli.github.com/"
}
