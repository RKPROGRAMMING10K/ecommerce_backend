# E-commerce Backend

Node.js backend with Express, MongoDB, and JWT authentication for the e-commerce demo.

## Features

- JWT-based authentication with refresh token support
- User registration and login
- Products management with search and filtering
- Shopping cart functionality
- Order management
- MongoDB integration with Mongoose
- Request logging middleware
- CORS enabled for frontend integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory with the following:
   ```
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_change_in_production
   PORT=5000
   ```

3. **Start MongoDB:**
   Make sure MongoDB is running on your system. If you have MongoDB installed locally:
   ```bash
   mongod
   ```

4. **Run the server:**
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

5. **The server will start on http://localhost:5000**

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products (with optional filtering)
- `GET /api/products?category=Electronics` - Filter by category
- `GET /api/products?search=phone` - Search products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (demo purposes)

### Cart (Requires authentication)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add product to cart
- `PUT /api/cart/:productId` - Update quantity
- `DELETE /api/cart/:productId` - Remove product from cart

### Orders (Requires authentication)
- `POST /api/orders` - Place order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:orderId` - Get single order

### Health Check
- `GET /api/health` - Server health check

## Sample Data

The server automatically creates sample products when starting with an empty database.

## Authentication

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Include access token in Authorization header: `Bearer <token>`
- Use refresh token endpoint to get new access token when expired

## Database Schema

### User
- name, email, password (hashed)
- refreshToken

### Product
- name, category, price, description

### Cart
- userId, items: [{ productId, quantity }]

### Order
- orderId, userId, userName, items, totalAmount, createdAt
