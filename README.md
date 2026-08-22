# LocalRoots

A full-stack local marketplace application that connects customers with local sellers and small businesses.

LocalRoots allows customers to browse products, manage their cart, place orders, and track orders. Sellers can add, edit, and delete products, manage stock, and view incoming orders.

---

## Features

### Customer Features

- Browse available products
- Search and filter products
- View detailed product information
- Add and remove products from the cart
- Update product quantities
- Add products to a wishlist
- Place orders
- Cash on Delivery option
- Demo Online Payment option
- View order history
- Update customer profile
- Add and view product reviews

### Seller Features

- Seller registration and login
- Seller dashboard
- Add new products
- Upload product images
- Edit existing products
- Delete products
- Manage product stock
- View seller orders
- Update order status
- View seller statistics

### General Features

- JWT-based authentication
- Role-based access for customers and sellers
- Responsive React frontend
- Express REST API
- MongoDB database
- Product image upload
- Cloudinary support when configured
- Automatic stock reduction after successful order placement
- Product search, category, city, and price filtering

---

## Tech Stack

### Frontend

- React
- Vite
- React Router DOM
- Lucide React
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Cloudinary

---

## Project Structure

```text
LocalRoots/
│
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── pages/
│   │   └── services/
│   │
│   └── package.json
│
├── backend/                  # Express + MongoDB backend
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   └── package.json
│
└── README.md
```

---

# Run Locally

## Prerequisites

Make sure the following are installed:

- Node.js
- npm
- MongoDB, or a MongoDB Atlas database

---

## 1. Clone the Repository

```bash
git clone <https://github.com/sanjeevsaroj/localroots.git >
cd LocalRoots
```

---

## 2. Backend Setup

Move into the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create your environment file.

### Windows

```bash
copy .env.example .env
```

### macOS/Linux

```bash
cp .env.example .env
```

Configure the required environment variables in:

```text
backend/.env
```

For example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Seed the database:

```bash
npm run seed
```

Start the backend development server:

```bash
npm run dev
```

The API normally runs on:

```text
http://localhost:5000
```

---

## 3. Frontend Setup

Open another terminal and move into the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the URL displayed by Vite, normally:

```text
http://localhost:5173
```

The Vite development server proxies `/api` and `/uploads` requests to the backend.

---

# Environment Variables

The MongoDB connection string and JWT secret are not included in the repository.

Create:

```text
backend/.env
```

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

If Cloudinary is configured, add the required Cloudinary environment variables as well.

---

# API Integration

The frontend communicates with the backend through the following API endpoints:

| Feature | Endpoint |
|---|---|
| Health Check | `/api/health` |
| Authentication | `/api/auth/*` |
| Products | `/api/products` |
| Product Reviews | `/api/products/:id/reviews` |
| Cart | `/api/cart` |
| Orders | `/api/orders` |
| Customer Orders | `/api/orders/my-orders` |
| Customer Dashboard | `/api/customer/*` |
| Seller Products | `/api/seller/products` |
| Seller Orders | `/api/seller/orders` |
| Seller Statistics | `/api/seller/stats` |

---

# Authentication

LocalRoots uses JWT-based authentication.

After successful login:

1. The backend generates a JWT token.
2. The frontend stores the token in browser local storage.
3. API requests send the token using:

```text
Authorization: Bearer <token>
```

The application supports role-based access for:

- Customer
- Seller

---

# Product Management

Authenticated sellers can:

- Create products
- Upload product images
- Edit their own products
- Delete their own products
- Manage stock

A seller cannot edit or delete products belonging to another seller.

---

# Order Flow

The order process works as follows:

1. Customer adds products to the cart.
2. Customer enters a delivery address.
3. Customer selects a payment method.
4. The backend validates the cart and available stock.
5. Product stock is reduced after successful order creation.
6. The cart is cleared.
7. The customer is redirected to the order success page.
8. The seller can view and update the status of relevant order items.

Current payment options:

- Cash on Delivery
- Demo Online Payment

> Demo Online Payment is simulated and does not process real payments.

---

# Demo and Showcase

The marketplace can be explored without logging in.

For authenticated customer and seller features, users can create their own accounts through the registration page.

Shared seller credentials are intentionally not publicly included because seller accounts can modify products, delete listings, and update order statuses.

For demonstrations, authenticated customer and seller features can be showcased by the project owner.

---

# Security Notes

Sensitive values are not included in the repository.

The following should never be committed publicly:

```text
MONGODB_URI
JWT_SECRET
Cloudinary credentials
```

Use environment variables through:

```text
backend/.env
```

and ensure `.env` is included in `.gitignore`.

---

# Future Improvements

Possible future enhancements include:

- Real payment gateway integration
- Email notifications
- Improved seller analytics
- Product recommendations
- Improved location-based product discovery
- Multiple product images
- Image deletion and replacement
- Pagination
- Order cancellation
- Admin dashboard
- Real-time notifications

---

# Author

**Sanjeev Saroj**

B.Tech Computer Science & Engineering  
IERT Prayagraj

---

# License

This project is created for educational and academic purposes.