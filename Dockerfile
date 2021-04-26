FROM onfinality/subql-node:v0.12.2

COPY . /app
RUN cd /app && npm install
RUN cd /app && npm run build
