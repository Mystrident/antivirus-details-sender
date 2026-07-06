#define MyAppName "Endpoint Agent"
#define MyAppVersion "1.0"
#define MyAppPublisher "Endpoint"

#define ServerUrl "https://antivirus-details-sender.onrender.com"
#define ApiKey "LCODEISTHEBEST"

[Setup]
AppId={{8C3EFB0D-2D2E-4A96-B5C5-8BDFD0C3A001}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={pf}\EndpointAgent
DefaultGroupName={#MyAppName}
PrivilegesRequired=admin
Compression=lzma
SolidCompression=yes
WizardStyle=modern
OutputDir=output
OutputBaseFilename=EndpointAgentSetup
ArchitecturesInstallIn64BitMode=x64
UninstallDisplayIcon={app}\EndpointTrayManager.exe

[Dirs]
Name: "{commonappdata}\EndpointAgent"

[Files]

; Service
Source: "installer-files\EndpointAgentService.exe"; DestDir: "{app}"; Flags: ignoreversion

; Tray Manager
Source: "installer-files\EndpointTrayManager.exe"; DestDir: "{app}"; Flags: ignoreversion

; Node Runtime
Source: "installer-files\node.exe"; DestDir: "{app}"; Flags: ignoreversion

; Package metadata (required for ESM)
Source: "installer-files\package.json"; DestDir: "{app}"; Flags: ignoreversion

; Application build
Source: "installer-files\dist\*"; DestDir: "{app}\dist"; Flags: recursesubdirs createallsubdirs ignoreversion

; Production dependencies only
Source: "installer-files\node_modules\*"; DestDir: "{app}\node_modules"; Flags: recursesubdirs createallsubdirs ignoreversion

[Registry]

Root: HKLM; \
Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; \
ValueType: string; \
ValueName: "EndpointTrayManager"; \
ValueData: """{app}\EndpointTrayManager.exe"""; \
Flags: uninsdeletevalue

[Run]

; Register + start the Windows Service (blocks until the install/start
; sequence inside EndpointAgentService.exe finishes)
Filename: "{app}\EndpointAgentService.exe"; \
Parameters: "install"; \
Flags: runhidden waituntilterminated

; Launch the tray app for the current user right after install.
; (This is the ONLY place the tray process gets started from the installer
; side — it's a plain user-mode exe, not a service, which is exactly why
; uninstall needs to explicitly kill it — see [UninstallRun] below.)
Filename: "{app}\EndpointTrayManager.exe"; \
Flags: nowait postinstall skipifsilent

[UninstallRun]

; 1. Kill the tray process first. It's a standalone user-mode app (not a
;    service), so nothing else in this uninstall sequence touches it.
;    Removing the Registry Run key above only stops it from launching at
;    the NEXT login — it does nothing to the copy already running, which
;    is why the tray icon used to survive uninstall.
Filename: "{sys}\taskkill.exe"; \
Parameters: "/F /IM EndpointTrayManager.exe /T"; \
Flags: runhidden waituntilterminated skipifdoesntexist

; 2. Stop + unregister the service. EndpointAgentService.exe's own
;    "uninstall" handler now blocks until the service actually reaches
;    STOPPED (see WaitForStopped() in Program.cs) before deleting it, so
;    this line no longer returns before the Node child process has
;    actually been killed by OnStop().
Filename: "{app}\EndpointAgentService.exe"; \
Parameters: "uninstall"; \
Flags: runhidden waituntilterminated skipifdoesntexist

[Code]

var
AssetPage: TInputQueryWizardPage;
LocationPage: TInputOptionWizardPage;

procedure InitializeWizard;
begin
AssetPage :=
CreateInputQueryPage(
wpWelcome,
'Endpoint Asset Information',
'Asset Details',
'Enter the asset information for this device.'
);

AssetPage.Add('Asset ID:', False);

LocationPage :=
CreateInputOptionPage(
AssetPage.ID,
'Location',
'Select Device Location',
'Choose the location of this endpoint.',
True,
False
);

LocationPage.Add('Chennai');
LocationPage.Add('Udupi');
LocationPage.Add('Mangalore');
LocationPage.Add('Kochi');

LocationPage.SelectedValueIndex := 0;
end;

function GetSelectedLocation(): String;
begin
if LocationPage.Values[0] then
Result := 'Chennai'
else if LocationPage.Values[1] then
Result := 'Udupi'
else if LocationPage.Values[2] then
Result := 'Mangalore'
else if LocationPage.Values[3] then
Result := 'Kochi'
else
Result := 'Chennai';
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
Result := True;

if CurPageID = AssetPage.ID then
begin
if Trim(AssetPage.Values[0]) = '' then
begin
MsgBox(
'Asset ID is required.',
mbError,
MB_OK
);


  Result := False;
  Exit;
end;


end;
end;

procedure CreateConfigFile;
var
ConfigPath: String;
ConfigContent: String;
begin
ConfigPath :=
ExpandConstant(
'{commonappdata}\EndpointAgent\config.json'
);

ConfigContent :=
'{' + #13#10 +
'  "configVersion": 1,' + #13#10 +
'  "serverUrl": "{#ServerUrl}",' + #13#10 +
'  "apiKey": "{#ApiKey}",' + #13#10 +
'  "assetId": "' + AssetPage.Values[0] + '",' + #13#10 +
'  "location": "' + GetSelectedLocation() + '",' + #13#10 +
'  "lastTelemetrySent": null' + #13#10 +
'}';

SaveStringToFile(
ConfigPath,
ConfigContent,
False
);
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
if CurStep = ssPostInstall then
begin
CreateConfigFile;
end;
end;
