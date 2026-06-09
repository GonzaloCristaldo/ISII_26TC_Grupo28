param(
  [int]$Passes = 3
)

$ErrorActionPreference = 'Stop'

if ($Passes -lt 3) {
  Write-Error 'Se requieren al menos 3 pasadas.'
}

$root = Split-Path -Parent $PSScriptRoot
$resultsDir = Join-Path $root 'test-results'
New-Item -ItemType Directory -Force -Path $resultsDir | Out-Null

for ($pass = 1; $pass -le $Passes; $pass++) {
  $resultFile = Join-Path $resultsDir "pasada-$pass.txt"
  $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

  "Pasada $pass de $Passes - $timestamp" | Tee-Object -FilePath $resultFile
  "Comando: npm run test:unit -- --reporter=verbose" | Tee-Object -Append -FilePath $resultFile
  '' | Tee-Object -Append -FilePath $resultFile

  & npm.cmd run test:unit -- --reporter=verbose 2>&1 | Tee-Object -Append -FilePath $resultFile

  if ($LASTEXITCODE -ne 0) {
    Write-Error "La pasada $pass fallo. Revisar $resultFile"
  }
}

Write-Host "Resultados guardados en $resultsDir"
