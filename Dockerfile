FROM onfinality/subql-node:v0.9.1

COPY . /app
RUN cd /app && npm install
RUN cd /app && npm run build
