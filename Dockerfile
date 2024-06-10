# Use the official Node.js image as the base image
FROM node:18.8


# Set the working directory
WORKDIR /

# Copy package.json and package-lock.json
COPY package.json ./
 
# Install dependencies
RUN npm install



# Copy the rest of the application code
COPY . .

#generate client prisma

RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on
EXPOSE 3005

# Set environment variables (replace these values with your actual database credentials)
ENV MYSQL_USER=root
ENV MYSQL_PASSWORD=2EwWraCDxsSuCJfJmge2TFuRAw8l5khX367ldrWw9cyCPcQqxfzdh0b7iPxm8Ojx
ENV MYSQL_HOST=64.227.40.34
ENV MYSQL_PORT=5435
ENV MYSQL_DATABASE=OTP

# Define the command to run the app
CMD ["npm", "run","dev"]

