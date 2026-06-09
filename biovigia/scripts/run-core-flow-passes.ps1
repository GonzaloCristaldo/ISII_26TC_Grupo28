param(
  [int]$Passes = 3
)

$ErrorActionPreference = 'Stop'

if ($Passes -lt 1) {
  Write-Error 'Debe ejecutar al menos 1 pasada.'
}

$root = Split-Path -Parent $PSScriptRoot
$resultsDir = Join-Path $root 'script-results'
New-Item -ItemType Directory -Force -Path $resultsDir | Out-Null

for ($pass = 1; $pass -le $Passes; $pass++) {
  $resultFile = Join-Path $resultsDir "consulta-actualizacion-pasada-$pass.txt"
  $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

  "Pasada $pass de $Passes - $timestamp" | Tee-Object -FilePath $resultFile
  "Comando: npm run script:core-flows" | Tee-Object -Append -FilePath $resultFile
  '' | Tee-Object -Append -FilePath $resultFile

  & npm.cmd run script:core-flows 2>&1 | Tee-Object -Append -FilePath $resultFile

  if ($LASTEXITCODE -ne 0) {
    Write-Error "La pasada $pass fallo. Revisar $resultFile"
  }
}

Write-Host "Resultados guardados en $resultsDir"
