# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Accept build argument for API key
ARG REACT_APP_ZALO_API_KEY
ENV REACT_APP_ZALO_API_KEY=$REACT_APP_ZALO_API_KEY

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 