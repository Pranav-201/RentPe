# Quick Start Guide

## 1. Extract the project

```bash
unzip ecommerce-zingoo.zip
cd ecommerce-zingoo
```

## 2. Install dependencies

```bash
npm install
```

## 3. Setup environment

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/zingoo-ecommerce
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

## 4. Start MongoDB

Make sure MongoDB is running:
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or using local MongoDB
mongod
```

## 5. Start the server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:3000`

## 6. Test the API

### Register a user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response will include a `token`. Use it for authenticated requests:

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

- **models/** - MongoDB schemas (User, Product, Order, etc.)
- **controllers/** - Business logic
- **routes/** - API endpoints
- **middleware/** - Auth, validation, error handling
- **config/** - Database & constants
- **utils/** - Helper functions

## Key Files

- `app.js` - Zingoo app setup with all routes
- `server.js` - Entry point
- `package.json` - Dependencies

## Important Notes

✅ **PHASE 1 ONLY** - This is the core e-commerce backend
❌ No AI, RAG, or LLM features yet
🚀 Ready for production use
✨ Clean, modular, well-structured

## Database Models

- **User** - Customers & admins with auth
- **Product** - Products with pricing & inventory
- **Category** - Product categories
- **Cart** - User shopping carts
- **CartItem** - Items in cart
- **Order** - Customer orders
- **OrderItem** - Items in order
- **Inventory** - Stock management
- **Review** - Product reviews & ratings

## API Response Format

All responses follow this format:

```json
{
  "message": "Success message",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

Error responses:
```json
{
  "error": "Error message",
  "details": [ ... ]
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

## Next Steps

1. Setup admin user in database
2. Test all endpoints
3. Create frontend
4. Deploy to production

## Support

For issues or questions, check the README.md file.
