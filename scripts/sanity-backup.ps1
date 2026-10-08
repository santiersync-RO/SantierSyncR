[CmdletBinding()]
param(
  [string] $Dataset = $env:SANITY_STUDIO_DATASET
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$workspaceRoot = (Resolve-Path (Join-Path $repoRoot "..")).Path
$studioPath = (Resolve-Path (Join-Path $repoRoot "studio")).Path
$projectId = $env:SANITY_STUDIO_PROJECT_ID
if ([string]::IsNullOrWhiteSpace($projectId)) {
  $studioEnv = Join-Path $studioPath '.env.local'
  if (Test-Path -LiteralPath $studioEnv) {
    foreach ($line in Get-Content -LiteralPath $studioEnv) {
      if ($line -match '^SANITY_STUDIO_PROJECT_ID=([a-z0-9]{8})$') { $projectId = $Matches[1] }
      if ([string]::IsNullOrWhiteSpace($Dataset) -and $line -match '^SANITY_STUDIO_DATASET=([a-z0-9_-]+)$') { $Dataset = $Matches[1] }
    }
  }
}
if ([string]::IsNullOrWhiteSpace($projectId)) {
  throw "SANITY_STUDIO_PROJECT_ID lipsește. Încarcă valorile locale din studio/.env.local înainte de backup."
}
if ([string]::IsNullOrWhiteSpace($Dataset)) {
  $Dataset = "production"
}

$backupDirectory = Join-Path $workspaceRoot "Backups\Sanity"
New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
$resolvedBackupDirectory = (Resolve-Path $backupDirectory).Path
$relativeBackupDirectory = [IO.Path]::GetRelativePath($workspaceRoot, $resolvedBackupDirectory)
if ([IO.Path]::IsPathRooted($relativeBackupDirectory) -or $relativeBackupDirectory -eq ".." -or $relativeBackupDirectory.StartsWith("..\", [StringComparison]::OrdinalIgnoreCase) -or $relativeBackupDirectory.StartsWith("../", [StringComparison]::OrdinalIgnoreCase)) {
  throw "Calea de backup a ieșit din rădăcina repository-ului; exportul a fost oprit."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss-fff"
$archivePath = Join-Path $resolvedBackupDirectory "santiersync-$Dataset-$timestamp.tar.gz"
if (Test-Path -LiteralPath $archivePath) {
  throw "Fișierul există deja; backupul nu îl va suprascrie: $archivePath"
}

Push-Location $studioPath
try {
  & npm.cmd exec -- sanity dataset export $Dataset $archivePath --project-id $projectId
  if ($LASTEXITCODE -ne 0) {
    throw "Sanity dataset export s-a încheiat cu codul $LASTEXITCODE. Verifică autentificarea și project ID-ul."
  }
} finally {
  Pop-Location
}

Write-Output "Backup Sanity exportat în: $archivePath"
