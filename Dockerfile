FROM onfinality/subql-node:v0.12.2

COPY . /app
RUN cd /app && yarn
RUN cd /app && yarn build
