# ✅ Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# ✅ Install dependencies
COPY package*.json ./
RUN npm install

# ✅ Add application source
COPY . .

# ❗ If your build uses environment variables like process.env.XYZ, add this:
# COPY .env .env

# 🔧 Clean any existing build cache to prevent webpack cache corruption
RUN rm -rf .next

# 🚨 This is the failing line. It's likely your build has issues.
RUN npm run build


# ✅ Production image
FROM node:20-alpine

WORKDIR /app

# ✅ Copy build artifacts and production dependencies
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# ✅ Port
EXPOSE 9009

# ✅ Run the production server
CMD ["npm", "run", "start", "--", "-p", "9009"]