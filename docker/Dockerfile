FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first to leverage Docker cache
COPY package.json package-lock.json* ./
RUN npm install

# Copy application files
COPY . .

# Expose Vite port
EXPOSE 5173

# Default development command
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
