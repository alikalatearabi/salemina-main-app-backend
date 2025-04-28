# Express API with Prisma and PostgreSQL

A RESTful API built with Express.js, Prisma ORM, and PostgreSQL.

## Features

- RESTful API with Express.js
- PostgreSQL database
- Prisma ORM for database access
- Docker and Docker Compose setup
- User CRUD operations
- Multi-step signup process
- Product catalog with barcode lookup
- Nutrition tracking and dashboard analytics

## Requirements

- Node.js 18+ 
- Docker and Docker Compose
- PostgreSQL (local or docker)

## Setup

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db?schema=public"
   PORT=3000
   NODE_ENV=development
   ```
4. Start PostgreSQL:
   ```bash
   docker-compose up -d db
   ```
5. Run Prisma migrations:
   ```bash
   npm run db:migrate
   ```
6. Seed the database with reference data:
   ```bash
   npm run db:seed
   ```
7. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Development

1. Build and start all services:
   ```bash
   docker-compose up -d
   ```
2. Run Prisma migrations:
   ```bash
   docker-compose exec app npm run db:migrate
   ```
3. Seed the database:
   ```bash
   docker-compose exec app npm run db:seed
   ```

## API Endpoints

### Authentication & Signup

The app features a multi-step signup process:

- `POST /api/auth/signup/phone` - Initial signup with phone number
- `POST /api/auth/signup/basic-info` - Save name, gender, birthdate
- `POST /api/auth/signup/physical-attributes` - Save height, weight, ideal weight
- `POST /api/auth/signup/health-info` - Save activity level and illnesses
- `POST /api/auth/signup/dietary-preferences` - Save appetite mode and food preferences
- `POST /api/auth/signup/allergies` - Save allergies
- `POST /api/auth/signup/water-intake` - Save daily water intake
- `POST /api/auth/signup/complete` - Complete the signup process

For tracking signup progress:
- `GET /api/auth/signup/progress/:userId` - Get user's signup progress

For reference data:
- `GET /api/auth/illnesses` - Get all available illnesses
- `GET /api/auth/allergies` - Get all available allergies
- `GET /api/auth/food-preferences` - Get all available food preferences

### Products

- `GET /api/products` - Get all products (with optional filters for brand, cluster)
- `GET /api/products/search?query=term` - Search products by name, brand, or description
- `GET /api/products/barcode/:barcode` - Get a product by barcode
- `POST /api/products` - Create a new product
- `PUT /api/products/barcode/:barcode` - Update a product
- `DELETE /api/products/barcode/:barcode` - Delete a product

### Nutrition Tracking & Dashboard

- `POST /api/nutrition/consumed` - Add a consumed product
- `GET /api/nutrition/consumed/user/:userId` - Get user's consumed products (with optional date filtering)
- `DELETE /api/nutrition/consumed/:id` - Delete a consumed product entry

Dashboard Analytics:
- `GET /api/nutrition/dashboard/daily/:userId` - Get daily nutrition summary
- `GET /api/nutrition/dashboard/weekly/:userId` - Get weekly nutrition summary
- `GET /api/nutrition/dashboard/monthly/:userId` - Get monthly nutrition summary

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

## Multi-step Signup Flow

The signup process follows these steps:

1. Phone verification: User enters phone number
2. Basic information: Name, gender, birth date
3. Physical attributes: Height, weight, ideal weight
4. Health information: Activity level, illnesses with severity levels
5. Dietary preferences: Appetite mode (low/normal/high), food preferences
6. Allergies: Any food allergies
7. Water intake: Daily water consumption level
8. Completion: Finalize the signup process

## Nutrition Tracking Process

Users can track their nutrition by:

1. Searching for products by name or scanning barcodes
2. Adding consumed products with quantities and meal types
3. Viewing their consumption history
4. Analyzing nutritional intake through dashboard analytics
5. Tracking progress daily, weekly, or monthly
6. Viewing meal-specific breakdowns (breakfast, lunch, dinner, snacks)

## Project Structure

```
├── prisma/               # Prisma schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.js           # Seed script for reference data
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   │   ├── authController.js       # Multi-step signup controller
│   │   ├── nutritionController.js  # Nutrition tracking controller
│   │   ├── productController.js    # Product controller
│   │   └── userController.js       # User CRUD operations
│   ├── middlewares/      # Custom middleware
│   ├── routes/           # Route definitions
│   │   ├── authRoutes.js       # Authentication routes
│   │   ├── nutritionRoutes.js  # Nutrition routes
│   │   ├── productRoutes.js    # Product routes
│   │   └── userRoutes.js       # User routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
├── .env.example          # Example environment variables
├── docker-compose.yml    # Docker Compose config
├── Dockerfile            # Docker build config
└── package.json          # Project dependencies
```

## License

ISC 