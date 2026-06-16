[Setup]
AppName=Endpoint Agent
AppVersion=1.0
DefaultDirName={pf}\EndpointAgent
DefaultGroupName=EndpointAgent
OutputDir=installer-output
OutputBaseFilename=EndpointAgentSetup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
DisableProgramGroupPage=yes

[Files]
Source: "*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs ignoreversion

[Run]
Filename: "{app}\EndpointAgent.exe"; Parameters: "install"; Flags: runhidden waituntilterminated
Filename: "{app}\EndpointAgent.exe"; Parameters: "start"; Flags: runhidden waituntilterminated

[UninstallRun]
Filename: "{app}\EndpointAgent.exe"; Parameters: "stop"; Flags: runhidden waituntilterminated
Filename: "{app}\EndpointAgent.exe"; Parameters: "uninstall"; Flags: runhidden waituntilterminated
