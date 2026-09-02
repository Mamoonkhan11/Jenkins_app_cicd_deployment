# Multi-stage Dockerfile for Attendance & Salary Management System

# Stage 1: Build & Packaging
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY index.html style.css app.js ./
RUN npm run build

# Stage 2: High-Performance Nginx Web Server Production Environment
FROM nginx:alpine
LABEL maintainer="DevOps Team"
LABEL project="Attendance-Salary-Management-System"

# Copy custom static Web Artifacts to Nginx default html folder
COPY --from=builder /app/index.html /usr/share/nginx/html/index.html
COPY --from=builder /app/style.css /usr/share/nginx/html/style.css
COPY --from=builder /app/app.js /usr/share/nginx/html/app.js

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
