#=================================================== BASE ===============================================================
FROM node:18-alpine3.16 AS base

# Due to npm permission error I used newly created user for all app commands.
# Log from that error:
# npm ERR! Your cache folder contains root-owned files, due to a bug in
# npm ERR! previous versions of npm which has since been addressed.
# npm ERR! 
# npm ERR! To permanently fix this problem, please run:
# npm ERR!   sudo chown -R 1001:1001 "/root/.npm"
RUN addgroup app && adduser -S -G app app
RUN mkdir /app && chown app:app /app
USER app
WORKDIR /app

# Copy both package files
COPY --chown=app:app package*.json ./

COPY --chown=app:app . .

# I removed "dist" folder here. Because when I added "dist" to .dockerignore I had an error during build production image.
# When I try: COPY --from=development /app/dist ./dist
RUN rm -rf ./dist

#=================================================== DEVELOPMENT ===============================================================
FROM base AS development
WORKDIR /app
USER app

RUN npm install
RUN npm run build

EXPOSE 8000
CMD [ "npm", "run", "serve" ]
#=================================================== PRODUCTION ===============================================================
FROM base AS production
WORKDIR /app
USER app

# Remove folders not related with production env.
RUN rm -rf ./src
RUN rm -rf ./tests

# Add compiled .js code from stage "development".
COPY --from=development /app/dist ./dist

RUN npm install --omit dev
RUN chmod 777 ./docker-scripts -R
EXPOSE 8080
