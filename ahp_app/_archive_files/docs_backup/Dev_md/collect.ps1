$ErrorActionPreference = 'Continue'

New-Item -ItemType Directory -Force -Path "Dev_md" | Out-Null

try { Get-Location | Out-File Dev_md/01_location.txt -Encoding UTF8 } catch {}
try { Get-ChildItem -Force | Out-File Dev_md/02_root_list.txt -Encoding UTF8 } catch {}
try { (git status -sb) 2>&1 | Out-File Dev_md/03_git_status.txt -Encoding UTF8 } catch {}
try { (git remote -v) 2>&1 | Out-File Dev_md/04_git_remotes.txt -Encoding UTF8 } catch {}

# File index
try {
  if (Get-Command rg -ErrorAction SilentlyContinue) {
    (rg --files) 2>&1 | Out-File Dev_md/05_files_rg.txt -Encoding UTF8
  } else {
    (Get-ChildItem -Recurse -File | Select-Object FullName) | Out-File Dev_md/05_files_fallback.txt -Encoding UTF8
  }
} catch {}

# Key files quick list
try {
  (Get-ChildItem -Recurse -File -Include package.json,package-lock.json,pnpm-lock.yaml,yarn.lock,requirements.txt,pyproject.toml,Pipfile,manage.py,README.md,AGENTS.md) |
    Select-Object FullName | Out-File Dev_md/06_key_files.txt -Encoding UTF8
} catch {}

# Runtime versions
try { (node -v) 2>&1 | Out-File Dev_md/11_node_version.txt -Encoding UTF8 } catch {}
try { (npm -v) 2>&1 | Out-File Dev_md/12_npm_version.txt -Encoding UTF8 } catch {}
try { (python --version) 2>&1 | Out-File Dev_md/13_python_version.txt -Encoding UTF8 } catch {}
try { (psql --version) 2>&1 | Out-File Dev_md/14_psql_version.txt -Encoding UTF8 } catch {}

# Backend health (deployed)
try {
  (Invoke-WebRequest https://ahp-django-backend.onrender.com/ -UseBasicParsing) 2>&1 |
    Select-Object StatusCode, StatusDescription, Headers, Content | Out-File Dev_md/41_deploy_health.txt -Encoding UTF8
} catch {}

# Optional DB checks (requires $env:DATABASE_URL)
if ($env:DATABASE_URL) {
  try { (psql "$env:DATABASE_URL" -c "select version();") 2>&1 | Out-File Dev_md/51_db_version.txt -Encoding UTF8 } catch {}
  try { (psql "$env:DATABASE_URL" -c "select 1;") 2>&1 | Out-File Dev_md/52_db_ping.txt -Encoding UTF8 } catch {}
}

Write-Host "Collection complete. See Dev_md/*.txt"

