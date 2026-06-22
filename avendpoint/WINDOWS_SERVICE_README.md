# Endpoint Agent - System Tray Manager

This folder contains the C# components for the Endpoint Agent system tray integration:
- **windows-service/**: Windows Service that manages the Node.js agent
- **tray-manager/**: System tray UI for user control

## Architecture

```
┌─────────────────────────────────────────┐
│     User (System Tray)                  │
│  EndpointTrayManager.exe                │
│  - Shows colored tray icon              │
│  - Right-click menu (Start/Stop)        │
└──────────────┬──────────────────────────┘
               │ Named Pipes (IPC)
┌──────────────▼──────────────────────────┐
│  Windows Service                        │
│  EndpointAgentService.exe               │
│  - Runs as Local System                 │
│  - Manages Node.js process              │
│  - Health monitoring                    │
│  - Event Log integration                │
└──────────────┬──────────────────────────┘
               │ Process Management
┌──────────────▼──────────────────────────┐
│  Node.js Application                    │
│  avendpoint (index.js)                  │
│  - Antivirus data collection            │
│  - Telemetry sending                    │
└─────────────────────────────────────────┘
```

## Project Structure

```
avendpoint/
├── src/                    # TypeScript/Node.js source
├── windows-service/        # C# Windows Service
│   ├── Program.cs
│   ├── AgentService.cs
│   ├── ProcessManager.cs
│   ├── PipeServer.cs
│   ├── ProjectInstaller.cs
│   └── EndpointAgentService.csproj
├── tray-manager/           # C# Tray Manager
│   ├── Program.cs
│   ├── TrayForm.cs
│   ├── PipeClient.cs
│   └── EndpointTrayManager.csproj
├── package.json
├── tsconfig.json
└── ...
```

## Building

### Prerequisites
- .NET 6.0 SDK or later
- Node.js 16+ (for avendpoint)

### Build Service
```bash
cd windows-service
dotnet build -c Release
```

Output: `windows-service/bin/Release/net6.0-windows/EndpointAgentService.exe`

### Build Tray Manager
```bash
cd tray-manager
dotnet build -c Release
```

Output: `tray-manager/bin/Release/net6.0-windows/EndpointTrayManager.exe`

### Build Node.js App
```bash
npm install
npm run build
```

## Installation

### 1. Build Everything
```bash
# Build C# service
cd windows-service
dotnet publish -c Release -o ./publish

# Build tray manager
cd ../tray-manager
dotnet publish -c Release -o ./publish

# Build Node.js app
cd ..
npm install
npm run build
```

### 2. Install to Program Files (Requires Admin)
```powershell
# Open PowerShell as Administrator
$installPath = "C:\Program Files\EndpointAgent"
mkdir $installPath -Force

# Copy C# executables
Copy-Item "windows-service\publish\*" "$installPath\" -Force
Copy-Item "tray-manager\publish\*" "$installPath\" -Force

# Copy Node.js app (built files)
Copy-Item "dist\*" "$installPath\avendpoint\" -Recurse -Force

# Copy Node.exe (download from https://nodejs.org)
Copy-Item "node.exe" "$installPath\" -Force
```

### 3. Register Windows Service (Admin)
```powershell
cd "C:\Program Files\EndpointAgent"
.\EndpointAgentService.exe install
```

### 4. Start Service
```powershell
# Option A: Services Manager
# Win+R → services.msc → Find "Endpoint Agent" → Right-click → Start

# Option B: Command Line
net start EndpointAgent
```

### 5. Launch Tray Manager
```powershell
# Run manually
C:\Program Files\EndpointAgent\EndpointTrayManager.exe

# Or add to Startup folder for auto-launch
$lnk = @"
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\EndpointTrayManager.lnk")
$Shortcut.TargetPath = "C:\Program Files\EndpointAgent\EndpointTrayManager.exe"
$Shortcut.Save()
"@
Invoke-Expression $lnk
```

## Usage

### System Tray Icon
- **Green circle**: Agent is running
- **Red circle**: Agent is stopped
- **Warning icon**: Communication error

### Right-Click Menu
- **Status**: Shows current status
- **Start Agent**: Starts the Node.js process
- **Stop Agent**: Stops the Node.js process
- **Exit Manager**: Closes the tray app (service continues running)

### Keyboard Shortcuts
- **Double-click tray icon**: Show/hide tray window

## Service Management

### View Logs
```powershell
# Event Viewer
eventvwr.msc

# Or command line
Get-EventLog -LogName Application -Source EndpointAgent -Newest 20
```

### Manual Control
```powershell
# Start service
net start EndpointAgent

# Stop service
net stop EndpointAgent

# Restart service
net stop EndpointAgent
net start EndpointAgent

# Check status
Get-Service EndpointAgent
```

### Uninstall Service
```powershell
# Stop first
net stop EndpointAgent

# Uninstall
C:\Program Files\EndpointAgent\EndpointAgentService.exe uninstall
```

## Debugging

### Run Service in Console (Debug Mode)
```powershell
# In Administrator Command Prompt
cd C:\Program Files\EndpointAgent
EndpointAgentService.exe debug
```

### Test IPC Communication
```powershell
$pipe = New-Object System.IO.Pipes.NamedPipeClientStream(".", "EndpointAgent", [System.IO.Pipes.PipeAccessRights]::ReadWrite)
$pipe.Connect()
$writer = New-Object System.IO.StreamWriter($pipe)
$writer.WriteLine("GET_STATUS")
$writer.Flush()
$reader = New-Object System.IO.StreamReader($pipe)
$reader.ReadLine()
```

## Troubleshooting

### Service Won't Start
1. Check Event Viewer (Application → EndpointAgent)
2. Verify Node.exe exists at `C:\Program Files\EndpointAgent\node.exe`
3. Check avendpoint app files exist at `C:\Program Files\EndpointAgent\avendpoint\`
4. Run in debug mode: `EndpointAgentService.exe debug`

### Tray Manager Can't Connect
- Ensure Service is running: `net start EndpointAgent`
- Check named pipes aren't blocked by firewall
- Try running as Administrator

### Node.js App Not Starting
- Verify index.js exists in avendpoint folder
- Check Node.exe version compatibility
- Review Event Log for specific errors
- Ensure config.json is properly formatted

## Configuration

Service reads from environment or App.config:

```xml
<configuration>
  <appSettings>
    <!-- Node.js app working directory -->
    <add key="NodeAppPath" value="C:\Program Files\EndpointAgent\avendpoint\"/>
    
    <!-- Node.exe path -->
    <add key="NodeExePath" value="C:\Program Files\EndpointAgent\node.exe"/>
    
    <!-- Health check interval (seconds) -->
    <add key="HealthCheckIntervalSeconds" value="30"/>
    
    <!-- Restart delay on crash (seconds) -->
    <add key="RestartDelaySeconds" value="5"/>
    
    <!-- Shutdown timeout (seconds) -->
    <add key="ProcessTimeoutSeconds" value="30"/>
  </appSettings>
</configuration>
```

## Deployment Checklist

- [ ] Build all components (Service, Tray, Node.js)
- [ ] Create installer (WiX or similar)
- [ ] Install service with admin rights
- [ ] Verify service appears in Services.msc
- [ ] Start service and check Event Log
- [ ] Launch tray manager
- [ ] Test right-click Start/Stop
- [ ] Verify auto-restart on crash
- [ ] Add tray manager to Startup folder
- [ ] Test reboot - service auto-starts

## Files Generated

- `windows-service/bin/Release/net6.0-windows/EndpointAgentService.exe`
- `tray-manager/bin/Release/net6.0-windows/EndpointTrayManager.exe`
- Node.js compiled/bundled executable (created by npm build)

## Security Notes

- Service runs as **Local System** (full privileges)
- Tray app runs as current user (limited privileges)
- Named Pipes restricted to local machine
- File permissions: Restrict to SYSTEM and Administrators
- Ensure signed executables for production

## Next Steps

1. Build and test all components locally
2. Create MSI/WiX installer
3. Test installation on clean Windows machine
4. Implement auto-update mechanism
5. Add signing certificates
6. Create deployment documentation
