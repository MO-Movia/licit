# To build:
#   docker build . -f style-service.Dockerfile -t style-service:latest

# To run (simple demo, data is lost when container is removed):
#   docker run -d -p 3005:3005 --name style-service style-service

# To make data persist across containers, create a volume:
#   docker volume create style-service-data
# Then bind container to volume when run
#   docker run -d -p3005:3005 -v style-service-data:/app/customstyles/ --name style-service style-service

FROM node:alpine

RUN mkdir -p /app/customstyles && mkdir -p /app/server

COPY servers/customstyles/run_customstyle_server.bundle.js /app/server/index.js

# Create volume to save styles if container is stopped.
VOLUME /app/customstyles

# Expose the server using default port
EXPOSE 3005

CMD cd /app/server && node .
