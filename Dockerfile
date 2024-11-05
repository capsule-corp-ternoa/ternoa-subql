# Build stage
FROM node:18 AS builder

WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./

# Install ALL dependencies (including dev dependencies)
RUN yarn install --frozen-lockfile

# Copy project files
COPY . .

# Install specific dependency
RUN npm install @ethersproject/abi

# Generate code and build
RUN yarn codegen && yarn build

# Final stage - using specific SubQuery node version
FROM onfinality/subql-node:v0.16.2

# Set working directory
WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/schema.graphql /app/schema.graphql
COPY --from=builder /app/project.yaml /app/project.yaml

# Ensure correct permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

# The entry point and cmd will be inherited from the base image