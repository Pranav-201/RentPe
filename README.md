# Zingoo E-commerce Backend

A production-style e-commerce backend built with **Zingoo** framework.

## PHASE 1 - Core Backend ✓

This is a complete, production-ready e-commerce platform with:

- ✅ User authentication (registration, login, JWT)
- ✅ Role-based authorization (admin/customer)
- ✅ Product management (CRUD)
- ✅ Category management
- ✅ Shopping cart
- ✅ Orders
- ✅ Order items
- ✅ Inventory management
- ✅ Product reviews
- ✅ Pagination & filtering
- ✅ Validation
- ✅ Error handling
- ✅ Built-in CORS & rate limiting

## Project Structure

```
├── config/              # Configuration files
│   ├── database.js      # MongoDB connection
│   └── constants.js     # Enums & constants
├── models/              # Mongoose models
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Cart.js
│   ├── CartItem.js
│   ├── Order.js
│   ├── OrderItem.js
│   ├── Inventory.js
│   └── Review.js
├── middleware/          # Custom middleware
│   ├── auth.js          # Authentication & authorization
│   ├── validation.js    # Request validation
│   └── errorHandler.js  # Error handling
├── controllers/         # Business logic
│   ├── authController.js
│   ├── productController.js
│   ├── categoryController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── reviewController.js
│   └── inventoryController.js
├── routes/              # API routes
│   ├── auth.js
│   ├── products.js
│   ├── categories.js
│   ├── cart.js
│   ├── orders.js
│   ├── reviews.js
│   └── inventory.js
├── utils/               # Utility functions
│   ├── jwt.js
│   └── pagination.js
├── app.js               # Zingoo app setup
├── server.js            # Entry point
├── package.json
└── .env.example
```

## Installation

```bash
npm install
```

## Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure your environment variables:
   - `MONGODB_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret key for JWT
   - `CORS_ORIGIN` - Frontend origin

3. Ensure MongoDB is running

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update status (admin only)
- `PATCH /api/orders/:id/cancel` - Cancel order

### Reviews
- `GET /api/products/:productId/reviews` - Get product reviews
- `POST /api/products/:productId/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Inventory (Admin)
- `GET /api/inventory/:productId` - Get inventory
- `PUT /api/inventory/:productId` - Update inventory
- `GET /api/inventory/low-stock` - Get low stock products
- `GET /api/inventory/out-of-stock` - Get out of stock products

## Built with Zingoo

### Features Used
- HTTP routing (`app.get`, `app.post`, `app.put`, `app.patch`, `app.delete`)
- Built-in CORS middleware
- Built-in rate limiting
- Response helpers (`res.ok`, `res.created`, `res.notFound`, etc.)
- Middleware chaining
- Error handling

### Database
- MongoDB with Mongoose ODM

### Authentication
- JWT with bcryptjs password hashing

### Validation
- Joi for request validation

## PHASE 2 Coming Soon

AI features will be added in Phase 2:
- AI-powered product search (RAG)
- AI recommendations
- AI customer support
- Streaming responses
- Multi-provider AI (Groq, Gemini)
- Document RAG system

## Notes

- All admin operations require authentication and admin role
- Customers can only access their own cart and orders
- Products are soft-deleted (isActive flag)
- Inventory auto-calculates available stock
- Order creation automatically reserves inventory
- Product ratings calculated from reviews
