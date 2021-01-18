# to build:
# docker build . -f style-service.Dockerfile -t style-service:latest

# to run (simple demo, data is lost if container is dropped):
# docker run -d --name style-service -p 3005:3005 style-service:latest


FROM node:alpine

RUN mkdir -p /app/customstyles && mkdir -p /app/server

COPY servers/customstyles/run_customstyle_server.bundle.js /app/server/index.js

VOLUME /app/customstyles
EXPOSE 3005

CMD cd /app/server && node .
