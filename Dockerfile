FROM node:18-alpine3.16 AS ninja-node

# Install git
RUN apk update
RUN apk add git

# Due to npm permission error I used newly created user for all app commands

RUN addgroup app && adduser -S -G app app
RUN mkdir /app && chown app:app /app

USER app

RUN git config --global --add safe.directory /app

# Log from that error:

# npm ERR! Your cache folder contains root-owned files, due to a bug in
# npm ERR! previous versions of npm which has since been addressed.
# npm ERR! 
# npm ERR! To permanently fix this problem, please run:
# npm ERR!   sudo chown -R 1001:1001 "/root/.npm"

WORKDIR /app

# Copy both package files
COPY --chown=app:app package*.json ./

# For Production Environment
# RUN npm install --omit=dev
RUN npm install

# Bundle app source
COPY --chown=app:app . .

EXPOSE 8080

CMD [ "npm", "start" ]