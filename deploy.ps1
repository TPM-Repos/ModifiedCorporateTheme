<#
.SYNOPSIS
    Cache-busting deploy script for TPM DriveWorks Live Templates.

.DESCRIPTION
    Updates the version query string on all script and stylesheet references
    across HTML files, and bumps config.version in configUser.js.
    Run this after making changes to ensure customers get fresh files.

.PARAMETER version
    The version string to stamp (e.g. "1.3.1"). If omitted, auto-increments
    the patch version from the current config.version.

.EXAMPLE
    .\deploy.ps1
    # Auto-increments: 1.3.0 -> 1.3.1

.EXAMPLE
    .\deploy.ps1 -version "2.0.0"
    # Sets a specific version
#>

param(
    [string]$version
)

$root = $PSScriptRoot
$configFile = Join-Path $root "configUser.js"

# Read current version from configUser.js
$configContent = Get-Content $configFile -Raw -Encoding utf8
$currentVersionMatch = [regex]::Match($configContent, 'version:\s*"([^"]+)"')
if (-not $currentVersionMatch.Success) {
    Write-Error "Could not find version in configUser.js"
    exit 1
}
$currentVersion = $currentVersionMatch.Groups[1].Value
Write-Host "Current version: $currentVersion" -ForegroundColor Cyan

# Determine new version
if (-not $version) {
    $parts = $currentVersion.Split(".")
    $parts[2] = [int]$parts[2] + 1
    $version = $parts -join "."
}
Write-Host "New version:     $version" -ForegroundColor Green

# Update config.version in configUser.js
$configContent = $configContent -replace ('version:\s*"' + [regex]::Escape($currentVersion) + '"'), "version: `"$version`""
Set-Content $configFile -Value $configContent -Encoding utf8 -NoNewline

# Find all HTML files
$htmlFiles = @()
$htmlFiles += Get-ChildItem -Path $root -Filter "*.html" -File
$queryDir = Join-Path $root "query"
if (Test-Path $queryDir) {
    $htmlFiles += Get-ChildItem -Path $queryDir -Filter "*.html" -File
}

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding utf8
    $original = $content

    # Update or add ?v= on script src attributes (local files only, not external URLs)
    # Matches: src="path/to/file.js" or src="path/to/file.js?v=1.2.3"
    $content = [regex]::Replace($content, '(src="(?!https?://)[^"]+\.js)(\?v=[^"]*)?(")', "`$1?v=$version`$3")

    # Update or add ?v= on stylesheet href attributes (local files only)
    # Matches: href="path/to/file.css" or href="path/to/file.css?v=1.2.3"
    $content = [regex]::Replace($content, '(href="(?!https?://)[^"]+\.css)(\?v=[^"]*)?(")', "`$1?v=$version`$3")

    if ($content -ne $original) {
        Set-Content $file.FullName -Value $content -Encoding utf8 -NoNewline
        Write-Host "  Updated: $($file.Name)" -ForegroundColor Yellow
    } else {
        Write-Host "  No changes: $($file.Name)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Deploy complete! Version $version stamped on all files." -ForegroundColor Green
Write-Host "Customers will receive fresh files on next page load." -ForegroundColor Green
