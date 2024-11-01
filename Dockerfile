FROM onfinality/subql-node:v0.16.2

COPY . /app
WORKDIR /app

# Install dependencies
RUN yarn install
RUN npm install @ethersproject/abi

# Generate code and build
RUN yarn codegen
RUN yarn build