# Render.com Blueprint Sync Script
# Blueprint ID: exs-d2e9lo3e5dus73fo4i30

param(
    [switch]$Force,
    [switch]$DryRun
)

$BlueprintId = "exs-d2e9lo3e5dus73fo4i30"
$ApiKey = $env:RENDER_API_KEY

if (-not $ApiKey) {
    Write-Host "Error: RENDER_API_KEY environment variable is not set" -ForegroundColor Red
    Write-Host "Set it using: `$env:RENDER_API_KEY = 'your-api-key'" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔄 Syncing Blueprint: $BlueprintId" -ForegroundColor Cyan
Write-Host "Repository: aebonlee/ahp-research-platform" -ForegroundColor Cyan
Write-Host "Branch: main" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "`n⚠️  DRY RUN MODE - No actual changes will be made" -ForegroundColor Yellow
}

# Function to sync blueprint
function Sync-Blueprint {
    $headers = @{
        "Authorization" = "Bearer $ApiKey"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        sync = $true
    } | ConvertTo-Json
    
    if ($DryRun) {
        Write-Host "`nDry run - would sync blueprint with render.yaml changes" -ForegroundColor Yellow
        return
    }
    
    try {
        Write-Host "`nSyncing blueprint..." -ForegroundColor Green
        
        $response = Invoke-RestMethod `
            -Uri "https://api.render.com/v1/blueprints/$BlueprintId/sync" `
            -Method Post `
            -Headers $headers `
            -Body $body
            
        Write-Host "✅ Blueprint sync initiated successfully!" -ForegroundColor Green
        
        # Show sync status
        if ($response.status) {
            Write-Host "Status: $($response.status)" -ForegroundColor Cyan
        }
        
        return $response
    }
    catch {
        Write-Host "❌ Failed to sync blueprint" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "`nAPI Key might be invalid or expired" -ForegroundColor Yellow
        }
        
        exit 1
    }
}

# Function to check blueprint status
function Get-BlueprintStatus {
    $headers = @{
        "Authorization" = "Bearer $ApiKey"
    }
    
    try {
        Write-Host "`nFetching blueprint status..." -ForegroundColor Yellow
        
        $response = Invoke-RestMethod `
            -Uri "https://api.render.com/v1/blueprints/$BlueprintId" `
            -Method Get `
            -Headers $headers
            
        Write-Host "`nBlueprint Details:" -ForegroundColor Cyan
        Write-Host "  Name: $($response.name)" -ForegroundColor White
        Write-Host "  Repo: $($response.repo)" -ForegroundColor White
        Write-Host "  Branch: $($response.branch)" -ForegroundColor White
        Write-Host "  Auto Sync: $($response.autoSync)" -ForegroundColor White
        Write-Host "  Last Synced: $($response.lastSyncedAt)" -ForegroundColor White
        
        return $response
    }
    catch {
        Write-Host "Failed to get blueprint status" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# Function to validate render.yaml
function Test-RenderYaml {
    $yamlPath = Join-Path $PSScriptRoot ".." "render.yaml"
    
    if (-not (Test-Path $yamlPath)) {
        Write-Host "❌ render.yaml not found at: $yamlPath" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ render.yaml found" -ForegroundColor Green
    
    # Check if YAML is valid (basic check)
    try {
        $yamlContent = Get-Content $yamlPath -Raw
        
        # Check for required sections
        $requiredSections = @("services", "databases")
        foreach ($section in $requiredSections) {
            if ($yamlContent -notmatch "^$section:", "Multiline") {
                Write-Host "⚠️  Warning: '$section' section not found in render.yaml" -ForegroundColor Yellow
            }
        }
        
        Write-Host "✅ render.yaml structure looks valid" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Error reading render.yaml" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $false
    }
}

# Main execution
Write-Host "`n📋 Pre-sync Checks" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

# Validate render.yaml
if (-not (Test-RenderYaml)) {
    if (-not $Force) {
        Write-Host "`nUse -Force flag to sync anyway" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "⚠️  Continuing with -Force flag" -ForegroundColor Yellow
}

# Get current status
$status = Get-BlueprintStatus

# Confirm sync
if (-not $Force -and -not $DryRun) {
    Write-Host "`n⚠️  This will sync the blueprint with the latest render.yaml" -ForegroundColor Yellow
    $confirm = Read-Host "Do you want to continue? (y/N)"
    
    if ($confirm -ne 'y') {
        Write-Host "Sync cancelled" -ForegroundColor Yellow
        exit 0
    }
}

# Perform sync
Write-Host "`n🚀 Starting Sync" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan

$result = Sync-Blueprint

if (-not $DryRun) {
    Write-Host "`n📊 Post-sync Status" -ForegroundColor Cyan
    Write-Host "==================" -ForegroundColor Cyan
    
    # Wait a moment for sync to process
    Start-Sleep -Seconds 2
    
    # Get updated status
    Get-BlueprintStatus | Out-Null
    
    Write-Host "`n✨ Sync Complete!" -ForegroundColor Green
    Write-Host "Check the Render dashboard for deployment status:" -ForegroundColor Cyan
    Write-Host "https://dashboard.render.com/blueprint/$BlueprintId" -ForegroundColor Blue
}

# Tips
Write-Host "`n💡 Tips:" -ForegroundColor Yellow
Write-Host "  - Use -DryRun to preview changes without syncing" -ForegroundColor Gray
Write-Host "  - Use -Force to skip confirmation prompts" -ForegroundColor Gray
Write-Host "  - Check logs in Render dashboard for detailed sync results" -ForegroundColor Gray