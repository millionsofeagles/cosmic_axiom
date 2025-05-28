# Cosmic Axiom Service Manager for Windows
# Run with: .\start.ps1

# Check if running as administrator (recommended for port management)
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "Warning: Running without administrator privileges. Some port cleanup features may not work." -ForegroundColor Yellow
    Write-Host ""
}

# Service definitions
$services = @{
    "astral" = @{
        port = 3001
        color = "Cyan"
        path = "services\astral"
    }
    "forge" = @{
        port = 3002
        color = "Green"
        path = "services\forge"
    }
    "library" = @{
        port = 3003
        color = "Yellow"
        path = "services\library"
    }
    "singularity" = @{
        port = 3004
        color = "Magenta"
        path = "services\singularity"
    }
    "satellite" = @{
        port = 3005
        color = "Blue"
        path = "services\satellite"
    }
    "horizon" = @{
        port = 3006
        color = "Red"
        path = "services\horizon"
    }
    "nebula" = @{
        port = 3007
        color = "White"
        path = "services\nebula"
    }
    "frontend" = @{
        port = 5173
        color = "DarkGreen"
        path = "frontend"
    }
}

# Store process information
$processes = @{}

# Function to print colored service messages
function Write-ServiceMessage {
    param(
        [string]$Service,
        [string]$Message,
        [string]$MessageColor = "White"
    )
    
    $color = $services[$Service].color
    Write-Host "[$Service]" -ForegroundColor $color -NoNewline
    Write-Host " $Message" -ForegroundColor $MessageColor
}

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# Function to kill process on port
function Stop-ProcessOnPort {
    param([int]$Port)
    
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connection) {
        $processId = $connection.OwningProcess | Select-Object -Unique
        foreach ($pid in $processId) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "Killed process on port $Port (PID: $pid)" -ForegroundColor Yellow
            } catch {
                Write-Host "Could not kill process on port $Port" -ForegroundColor Red
            }
        }
    }
}

# Cleanup function
function Stop-AllServices {
    Write-Host "`n" -NoNewline
    Write-Host "Shutting down all services..." -ForegroundColor Red -BackgroundColor Black
    
    foreach ($name in $processes.Keys) {
        $proc = $processes[$name]
        if ($proc -and !$proc.HasExited) {
            Write-ServiceMessage $name "Stopping..."
            try {
                $proc.Kill()
                $proc.WaitForExit(5000)
            } catch {
                # Process might have already exited
            }
        }
    }
    
    Write-Host "All services stopped." -ForegroundColor Green
}

# Register cleanup on script exit
Register-EngineEvent PowerShell.Exiting -Action { Stop-AllServices } | Out-Null

# Clear screen
Clear-Host

# Print header
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║               COSMIC AXIOM - Service Manager               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is running
Write-Host "Checking MySQL..." -ForegroundColor White
$mysqlContainer = docker ps --format "table {{.Names}}" | Select-String "mysql-cosmic-axiom"
if (-not $mysqlContainer) {
    Write-Host "ERROR: MySQL container is not running!" -ForegroundColor Red
    Write-Host "Please run '.\infra\standup.ps1' first to set up the database." -ForegroundColor Yellow
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}
Write-Host "✓ MySQL is running" -ForegroundColor Green
Write-Host ""

# Check for .env files
Write-Host "Checking environment configuration..." -ForegroundColor White
$missingEnv = $false

# Check backend services
$backendServices = @("astral", "forge", "library", "singularity", "satellite", "horizon", "nebula")
foreach ($service in $backendServices) {
    $envPath = "services\$service\.env"
    if (-not (Test-Path $envPath)) {
        Write-Host "✗ Missing .env file for $service" -ForegroundColor Red
        $missingEnv = $true
    } else {
        # Check for placeholder values that need to be updated
        if ($service -eq "nebula") {
            $content = Get-Content $envPath -Raw
            if ($content -match "your_claude_api_key_here") {
                Write-Host "⚠ $service .env contains placeholder API key" -ForegroundColor Yellow
            }
        }
    }
}

# Check frontend
if (-not (Test-Path "frontend\.env")) {
    Write-Host "✗ Missing .env file for frontend" -ForegroundColor Red
    $missingEnv = $true
}

if ($missingEnv) {
    Write-Host "ERROR: Missing .env files detected!" -ForegroundColor Red
    Write-Host "Please run '.\infra\standup.ps1' first to set up environment files." -ForegroundColor Yellow
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "✓ Environment configuration complete" -ForegroundColor Green
Write-Host ""

# Check for existing processes on ports
Write-Host "Checking for existing processes..." -ForegroundColor White
foreach ($service in $services.Keys) {
    $port = $services[$service].port
    if (Test-Port $port) {
        Write-Host "Port $port is in use, attempting to free it..." -ForegroundColor Yellow
        Stop-ProcessOnPort $port
        Start-Sleep -Milliseconds 500
    }
}
Write-Host ""

# Function to start a service
function Start-Service {
    param(
        [string]$Name,
        [hashtable]$Config
    )
    
    $servicePath = Join-Path $PSScriptRoot $Config.path
    
    # Check if directory exists
    if (-not (Test-Path $servicePath)) {
        Write-ServiceMessage $Name "ERROR: Directory not found" "Red"
        return $null
    }
    
    # Check if node_modules exists
    $nodeModulesPath = Join-Path $servicePath "node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Write-ServiceMessage $Name "Installing dependencies..." "Yellow"
        $npmInstall = Start-Process -FilePath "npm" -ArgumentList "install" -WorkingDirectory $servicePath -Wait -NoNewWindow -PassThru
        if ($npmInstall.ExitCode -ne 0) {
            Write-ServiceMessage $Name "Failed to install dependencies" "Red"
            return $null
        }
    }
    
    Write-ServiceMessage $Name "Starting on port $($Config.port)..."
    
    # Start the service
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "cmd"
    $psi.Arguments = "/c npm run dev 2>&1"
    $psi.WorkingDirectory = $servicePath
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true
    
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $psi
    
    # Set up event handlers for output
    $outputScript = {
        if ($EventArgs.Data) {
            $service = $Event.MessageData.Service
            $color = $Event.MessageData.Color
            Write-Host "[$service]" -ForegroundColor $color -NoNewline
            Write-Host " $($EventArgs.Data)"
        }
    }
    
    $messageData = @{
        Service = $Name
        Color = $Config.color
    }
    
    Register-ObjectEvent -InputObject $process -EventName OutputDataReceived -Action $outputScript -MessageData $messageData | Out-Null
    Register-ObjectEvent -InputObject $process -EventName ErrorDataReceived -Action $outputScript -MessageData $messageData | Out-Null
    
    $process.Start() | Out-Null
    $process.BeginOutputReadLine()
    $process.BeginErrorReadLine()
    
    return $process
}

# Start backend services
Write-Host "Starting backend services..." -ForegroundColor White
$backendServices = @("astral", "forge", "library", "singularity", "satellite", "horizon", "nebula")

foreach ($service in $backendServices) {
    $proc = Start-Service -Name $service -Config $services[$service]
    if ($proc) {
        $processes[$service] = $proc
        Start-Sleep -Seconds 2
    }
}

Write-Host ""
Write-Host "Starting frontend..." -ForegroundColor White

# Start frontend
$proc = Start-Service -Name "frontend" -Config $services["frontend"]
if ($proc) {
    $processes["frontend"] = $proc
}

# Wait for services to initialize
Start-Sleep -Seconds 5

# Print status
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    Service Status                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

foreach ($service in $services.Keys) {
    $port = $services[$service].port
    $color = $services[$service].color
    
    Write-Host "● " -NoNewline -ForegroundColor $color
    Write-Host "$service" -NoNewline -ForegroundColor $color
    Write-Host " - " -NoNewline
    
    if (Test-Port $port) {
        Write-Host "Running" -NoNewline -ForegroundColor Green
        Write-Host " on port $port"
    } else {
        Write-Host "Failed" -NoNewline -ForegroundColor Red
        Write-Host " on port $port"
    }
}

Write-Host ""
Write-Host "All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Access the application at: " -NoNewline
Write-Host "http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default credentials:" -ForegroundColor White
Write-Host "  Admin: " -NoNewline
Write-Host "admin@cosmic.com / admin123" -ForegroundColor Yellow
Write-Host "  User:  " -NoNewline
Write-Host "user@cosmic.com / user123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press " -NoNewline
Write-Host "Ctrl+C" -ForegroundColor Red -NoNewline
Write-Host " to stop all services"
Write-Host ""

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Check if any critical process has exited
        $exitedProcess = $null
        foreach ($name in $processes.Keys) {
            if ($processes[$name] -and $processes[$name].HasExited) {
                $exitedProcess = $name
                break
            }
        }
        
        if ($exitedProcess) {
            Write-Host ""
            Write-ServiceMessage $exitedProcess "Process exited unexpectedly!" "Red"
            Write-Host "Restarting service..." -ForegroundColor Yellow
            
            # Restart the service
            $proc = Start-Service -Name $exitedProcess -Config $services[$exitedProcess]
            if ($proc) {
                $processes[$exitedProcess] = $proc
            }
        }
    }
}
finally {
    Stop-AllServices
}