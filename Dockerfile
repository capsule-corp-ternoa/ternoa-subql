# Use a multi-stage build to keep the final image smaller
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy project files
COPY . .

# Install additional dependencies
RUN npm install @ethersproject/abi

# Generate code and build
RUN yarn codegen
RUN yarn build

# Final stage
FROM onfinality/subql-node:v0.16.2

# Copy built files from builder stage
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/schema.graphql /app/schema.graphql
COPY --from=builder /app/project.yaml /app/project.yaml

WORKDIR /app

# The entry point and cmd will be inherited from the base image