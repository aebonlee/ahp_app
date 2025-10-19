$ErrorActionPreference = 'Continue'

# Ensure we run from repo root (parent of this script directory)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Split-Path -Parent $scriptDir)

function ReadFile($path) {
  if (Test-Path $path) { return (Get-Content $path -Raw) } else { return $null }
}

function FirstLines($text, $maxLines) {
  if (-not $text) { return $null }
  $lines = $text -split "`n"
  $take = [Math]::Min($maxLines, $lines.Length)
  return ($lines[0..($take-1)] -join "`n")
}

$files = @{
  loc   = 'Dev_md/01_location.txt'
  ls    = 'Dev_md/02_root_list.txt'
  gst   = 'Dev_md/03_git_status.txt'
  grm   = 'Dev_md/04_git_remotes.txt'
  rg    = 'Dev_md/05_files_rg.txt'
  idx   = 'Dev_md/05_files_fallback.txt'
  key   = 'Dev_md/06_key_files.txt'
  node  = 'Dev_md/11_node_version.txt'
  npm   = 'Dev_md/12_npm_version.txt'
  py    = 'Dev_md/13_python_version.txt'
  psql  = 'Dev_md/14_psql_version.txt'
  health= 'Dev_md/41_deploy_health.txt'
  dbv   = 'Dev_md/51_db_version.txt'
  dbp   = 'Dev_md/52_db_ping.txt'
}

$out = @()
$out += '# AHP Platform Inspection (Measured)'
$out += 'Generated: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
$out += ''

# Collected files overview
$out += '## Collected Files'
foreach ($k in $files.Keys) {
  $exists = if (Test-Path $files[$k]) { 'OK' } else { 'MISSING' }
  $out += ('- ' + $k + ': ' + $files[$k] + ' => ' + $exists)
}

# Local / Git
$out += ''
$out += '## 1) Local / Git'
$loc = ReadFile $files.loc; if (-not $loc) { $loc = '(missing)' }
$out += '### Location'
$out += $loc
$out += ''
$ls = FirstLines (ReadFile $files.ls) 200; if (-not $ls) { $ls = '(missing)' }
$out += '### Root list (top 200)'
$out += $ls
$out += ''
$gst = ReadFile $files.gst; if (-not $gst) { $gst = '(missing)' }
$out += '### git status'
$out += $gst
$out += ''
$grm = ReadFile $files.grm; if (-not $grm) { $grm = '(missing)' }
$out += '### git remotes'
$out += $grm

# Runtime
$out += ''
$out += '## 2) Runtime Versions'
$node = ReadFile $files.node; if (-not $node) { $node = '(missing)' }
$npm  = ReadFile $files.npm;  if (-not $npm)  { $npm  = '(missing)' }
$py   = ReadFile $files.py;   if (-not $py)   { $py   = '(missing)' }
$psql = ReadFile $files.psql; if (-not $psql) { $psql = '(missing)' }
$out += ('- Node: ' + $node)
$out += ('- npm: '  + $npm)
$out += ('- Python: ' + $py)
$out += ('- psql: ' + $psql)

# Key files / index
$out += ''
$out += '## 3) Key Files and Index'
$key = ReadFile $files.key; if (-not $key) { $key = '(missing)' }
$out += '### Key file paths'
$out += $key
$out += ''
$idx = ReadFile $files.rg; if (-not $idx) { $idx = ReadFile $files.idx }
$idxTop = FirstLines $idx 200; if (-not $idxTop) { $idxTop = '(missing)' }
$out += '### File index (top 200)'
$out += $idxTop

# Deploy health
$out += ''
$out += '## 4) Deployed Backend Health'
$health = ReadFile $files.health
if ($health) {
  $statusLine = ($health -split "`n" | Select-String -Pattern 'StatusCode|StatusDescription' -SimpleMatch) -join ' | '
  if (-not $statusLine) { $statusLine = '(status parse unavailable)' }
  $out += ('Summary: ' + $statusLine)
  $out += ''
  $out += 'Response (top 60 lines)'
  $out += FirstLines $health 60
} else {
  $out += '(no collected health output)'
}

# DB
$out += ''
$out += '## 5) Database Connectivity'
$dbv = ReadFile $files.dbv; if (-not $dbv) { $dbv = '(not executed)' }
$dbp = ReadFile $files.dbp; if (-not $dbp) { $dbp = '(not executed)' }
$out += '### version()'
$out += $dbv
$out += ''
$out += '### select 1'
$out += $dbp

# Next steps
$out += ''
$out += '## 6) Notes / Next Steps'
$out += '- Review git status and remotes.'
$out += '- Validate FE/BE build and migrations if needed.'
$out += '- I can refine recommendations based on these outputs.'

$target1 = 'Dev_md/점검보고서_실측.md'
$target2 = 'Dev_md/report_measured.md'
$content = ($out -join "`n")
try { $content | Out-File $target1 -Encoding UTF8 } catch {}
try { $content | Out-File $target2 -Encoding UTF8 } catch {}
Write-Host ('Updated: ' + $target1 + ' and ' + $target2)
