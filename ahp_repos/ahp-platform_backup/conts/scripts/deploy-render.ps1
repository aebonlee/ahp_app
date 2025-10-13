# Render.com Team Plan Deployment Script for Windows
# Usage: .\deploy-render.ps1 -Environment [production|staging] -Service [all|backend|frontend]
# Example: .\deploy-render.ps1 -Environment production -Service backend

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "staging",
    
    [Parameter(Mandatory=$false)]
    [string]$Service = "all",
    
    [switch]$Wait
)

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Check for API key
$apiKey = $env:RENDER_API_KEY
if (-not $apiKey) {
    Write-ColorOutput Red "Error: RENDER_API_KEY environment variable is not set"
    exit 1
}

Write-ColorOutput Green "🚀 Starting deployment to Render.com"
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Service: $Service" -ForegroundColor Yellow

# Function to deploy a service
function Deploy-Service {
    param($ServiceName)
    
    Write-Host "`nDeploying $ServiceName..." -ForegroundColor Green
    
    $headers = @{
        "Authorization" = "Bearer $apiKey"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        clearCache = $false
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod `
            -Uri "https://api.render.com/v1/services/$ServiceName/deploys" `
            -Method Post `
            -Headers $headers `
            -Body $body
            
        Write-Host "✓ Deployment triggered for $ServiceName" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Failed to deploy $ServiceName" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# Function to check deployment status
function Check-Status {
    param($ServiceName)
    
    Write-Host "`nChecking deployment status for $ServiceName..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $apiKey"
    }
    
    try {
        $response = Invoke-RestMethod `
            -Uri "https://api.render.com/v1/services/$ServiceName/deploys?limit=1" `
            -Method Get `
            -Headers $headers
            
        $latest = $response[0]
        Write-Host "Status: $($latest.status)" -ForegroundColor Cyan
        Write-Host "Created: $($latest.createdAt)" -ForegroundColor Cyan
    }
    catch {
        Write-Host "Failed to get status" -ForegroundColor Red
    }
}

# Main deployment logic
switch ($Environment) {
    {$_ -in "production", "prod"} {
        if ($Service -eq "all" -or $Service -eq "backend") {
            Deploy-Service "ahp-backend-prod"
        }
        if ($Service -eq "all" -or $Service -eq "frontend") {
            Deploy-Service "ahp-frontend-prod"
        }
    }
    
    {$_ -in "staging", "stage"} {
        if ($Service -eq "all" -or $Service -eq "backend") {
            Deploy-Service "ahp-backend-staging"
        }
        if ($Service -eq "all" -or $Service -eq "frontend") {
            Deploy-Service "ahp-frontend-staging"
        }
    }
    
    default {
        Write-Host "Invalid environment: $Environment" -ForegroundColor Red
        Write-Host "Valid environments: production, staging"
        exit 1
    }
}

Write-Host "`n🎉 Deployment initiated successfully!" -ForegroundColor Green
Write-Host "Check Render dashboard for deployment progress" -ForegroundColor Yellow

# Optional: Wait and check status
if ($Wait) {
    Write-Host "`nWaiting for deployment to complete..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    if ($Service -eq "all" -or $Service -eq "backend") {
        Check-Status "ahp-backend-$Environment"
    }
    if ($Service -eq "all" -or $Service -eq "frontend") {
        Check-Status "ahp-frontend-$Environment"
    }
}