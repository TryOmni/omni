# Dockerfile
FROM node:14 as build-stage
WORKDIR /app

# Install dependencies first to utilize Docker caching for better performance
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# Copy all source code
COPY . .

# Build the app
RUN npm run build

# Use an Nginx image to serve the build folder
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/build /usr/share/nginx/html

# Copy custom Nginx config file (if any)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
