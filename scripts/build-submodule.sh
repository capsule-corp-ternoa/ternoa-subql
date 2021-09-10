git submodule update --init

cd ../../..
cd subql/packages/types
npm install
npm run build

cd subql/packages/common
npm install
npm run build

cd ../../..
cd subql/packages/validator
npm install
npm run build

cd ../../..
cd subql/packages/query
npm install
npm run build

cd ../../..
cd subql/packages/node
npm install
npm run build


# cp bin/run bin/ternoa-query

cd ../../..
mkdir -p bin
cd bin
ln -sf ../subql/packages/query/bin/run ternoa-query
