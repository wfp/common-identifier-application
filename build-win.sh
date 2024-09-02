
echo "---------- NWS -----------------"
node tools/activate-algo.js algo-uscadi
npx electron-forge make --arch=x64 --platform=win32
mv out/ui-win32-x64 out/ui-win32-x64-nws
(cd out && zip -r ui-win32-x64-nws ui-win32-x64-nws)

echo "---------- GOS -----------------"
node tools/activate-algo.js algo-gos
npx electron-forge make --arch=x64 --platform=win32
mv out/ui-win32-x64 out/ui-win32-x64-gos
(cd out && zip -r ui-win32-x64-gos ui-win32-x64-gos)