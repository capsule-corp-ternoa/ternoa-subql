git submodule update --init --recusrive --remote --merge

cd subql
git checkout main
git pull origin main

cd packages/query

npm install
npm run build
# cp bin/run bin/ternoa-query

cd ../../..
mkdir -p bin
cd bin
ln -sf ../subql/packages/query/bin/run ternoa-query
