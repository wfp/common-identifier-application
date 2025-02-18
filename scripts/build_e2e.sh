npm run clean:all
git clone --filter=blob:none --no-checkout --depth 1 https://github.com/wfp/common-identifier-algorithms algo_repo
cd algo_repo
git sparse-checkout init --no-cone
git sparse-checkout set syria
git checkout
cp -r syria ../electron/main/algo
cd ../
rm algo_repo -r -fo

npm install

node scripts/activate-algo.ts SYR
npm run build

node scripts/update-rendered-components.ts SYR
node scripts/prepackage.ts SYR

npm run package

node scripts/clean.ts
echo DONE


# npm run clean:all
# git clone --filter=blob:none --no-checkout --depth 1 https://github.com/wfp/common-identifier-algorithms algo_repo
# cd algo_repo
# git sparse-checkout init --no-cone
# git sparse-checkout set syria_north_west
# git checkout
# cp -r syria_north_west ../electron/main/algo
# cd ../
# rm algo_repo -r -fo

# npm install

# node scripts/activate-algo.ts NWS
# npm run build

# node scripts/update-rendered-components.ts NWS
# node scripts/prepackage.ts NWS

# npm run package

# node scripts/clean.ts