# Dockerfile for React frontend
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package.json /app/
COPY package-lock.json /app/

# Install dependencies
RUN npm install

# Now copy the rest of the project files
COPY . /app/

# Expose port 3000
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
