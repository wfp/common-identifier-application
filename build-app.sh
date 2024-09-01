# TODO: these should be injected from the build pipeline
ALGORITHM_WRAPPER_REPO=...
ALGORITHM_NWS_REPO=...
ALGORITHM_GOS_REPO=...

BUILD_OUTPUT_DIR=./_build

git submodule update

# NWS
# ===


node tools/activate-algo.js algo-uscadi

# Build the executable for windows and mac
# NOTE: the "arch=x64" for windows is needed on mac to have it build the proper executable
echo "BUILDING FOR WINDOWS"
npx electron-forge make --arch=x64 --platform=win32

echo "BUILDING FOR MACOS"
npx electron-forge make --platform=darwin

cp -r out/ui-win32-x64    $BUILD_OUTPUT_DIR/nws/ui-win32-x64
cp -r out/ui-darwin-arm64 $BUILD_OUTPUT_DIR/nws/ui-darwin-arm64

# GOS
# ===

node tools/activate-algo.js algo-gos

# Build the executable for windows and mac
# NOTE: the "arch=x64" for windows is needed on mac to have it build the proper executable
echo "BUILDING FOR WINDOWS"
npx electron-forge make --arch=x64 --platform=win32

echo "BUILDING FOR MACOS"
npx electron-forge make --platform=darwin

cp -r out/ui-win32-x64    $BUILD_OUTPUT_DIR/gos/ui-win32-x64
cp -r out/ui-darwin-arm64 $BUILD_OUTPUT_DIR/gos/ui-darwin-arm64