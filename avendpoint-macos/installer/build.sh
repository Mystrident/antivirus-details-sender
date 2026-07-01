#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

PAYLOAD="$PROJECT_ROOT/installer/payload"
APP="$PAYLOAD/Library/Application Support/EndpointAgent"

echo "===================================="
echo " Cleaning previous payload"
echo "===================================="

rm -rf "$PAYLOAD"

mkdir -p "$APP"
mkdir -p "$PAYLOAD/Library/LaunchDaemons"
mkdir -p "$PAYLOAD/Library/LaunchAgents"

echo
echo "===================================="
echo " Building Swift Service"
echo "===================================="

cd "$PROJECT_ROOT/EndpointAgentService"

swift build -c release

cp .build/release/EndpointAgentService \
"$APP/EndpointAgentService"

echo
echo "===================================="
echo " Building Tray"
echo "===================================="

cd "$PROJECT_ROOT/EndpointTray"

swift build -c release

cp .build/release/EndpointTray \
"$APP/EndpointTray"

echo
echo "===================================="
echo " Building Node Agent"
echo "===================================="

cd "$PROJECT_ROOT"

npm install

npm run build

echo
echo "===================================="
echo " Copying Node Agent"
echo "===================================="

cp -R dist "$APP/"
cp -R node_modules "$APP/"

cp package.json "$APP/"
cp package-lock.json "$APP/"
cp config.json "$APP/"

echo
echo "===================================="
echo " Copying Node Runtime"
echo "===================================="

NODE_RUNTIME="$PROJECT_ROOT/installer/cache/node-v26.4.0-darwin-arm64"

if [ ! -d "$NODE_RUNTIME" ]; then
    echo "Node runtime not found!"
    exit 1
fi

mkdir -p "$APP/node"

cp -R "$NODE_RUNTIME/bin" "$APP/node/"
cp -R "$NODE_RUNTIME/lib" "$APP/node/"

echo
echo "===================================="
echo " Copying Launchd Plists"
echo "===================================="

cp \
"$PROJECT_ROOT/installer/com.endpoint.agent.plist" \
"$PAYLOAD/Library/LaunchDaemons/"

cp \
"$PROJECT_ROOT/installer/com.endpoint.tray.plist" \
"$PAYLOAD/Library/LaunchAgents/"
echo
echo "===================================="
echo " Preparing installer scripts"
echo "===================================="

chmod +x "$PROJECT_ROOT/installer/scripts/preinstall"
chmod +x "$PROJECT_ROOT/installer/scripts/postinstall"

echo
echo "===================================="
echo " Building Component Package"
echo "===================================="

rm -f "$PROJECT_ROOT/installer/EndpointAgent.pkg"

pkgbuild \
    --root "$PAYLOAD" \
    --scripts "$PROJECT_ROOT/installer/scripts" \
    --identifier "com.endpoint.agent" \
    --version "1.0.0" \
    --install-location "/" \
    "$PROJECT_ROOT/installer/EndpointAgent.pkg"