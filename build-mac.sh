
echo "---------- NWS -----------------"
node tools/activate-algo.js algo-uscadi
npx electron-forge make

mv out/make/zip/darwin/arm64/ui-darwin-arm64-1.0.0.zip out/ui-darwin-arm64-nws-1.0.0.zip
# mv out/ui-win32-x64 out/ui-win32-x64-nws
# (cd out && zip -r ui-win32-x64-nws ui-win32-x64-nws)

echo "---------- GOS -----------------"
node tools/activate-algo.js algo-gos
npx electron-forge make

mv out/make/zip/darwin/arm64/ui-darwin-arm64-1.0.0.zip out/ui-darwin-arm64-gos-1.0.0.zip
# mv out/ui-win32-x64 out/ui-win32-x64-gos
# (cd out && zip -r ui-win32-x64-gos ui-win32-x64-gos)