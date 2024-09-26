
echo "---------- NWS -----------------"
node tools/activate-algo.js algo-uscadi
npx electron-forge make --arch=x64 --platform=win32
mv out/commonid-tool-win32-x64 out/commonid-tool-win32-x64-nws
(cd out && zip -r commonid-tool-win32-x64-nws commonid-tool-win32-x64-nws)

echo "---------- GOS -----------------"
node tools/activate-algo.js algo-gos
npx electron-forge make --arch=x64 --platform=win32
mv out/commonid-tool-win32-x64 out/commonid-tool-win32-x64-gos
(cd out && zip -r commonid-tool-win32-x64-gos commonid-tool-win32-x64-gos)