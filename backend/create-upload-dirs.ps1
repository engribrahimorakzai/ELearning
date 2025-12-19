# Create upload directories
if (-not (Test-Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads" | Out-Null
}

$directories = @("image", "video", "document", "general")

foreach ($dir in $directories) {
    $path = "uploads\$dir"
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path | Out-Null
        Write-Host "Created directory: $path"
    }
}

Write-Host "`nUpload directories created successfully!" -ForegroundColor Green
