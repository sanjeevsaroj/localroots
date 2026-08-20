# LocalRoots — connected frontend + backend

## Structure

- `frontend/` — React + Vite UI
- `backend/` — Express + MongoDB API

## Run locally

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

On macOS/Linux use:

```bash
cp .env.example .env
```

The API runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` and `/uploads` to the backend.

Open the URL printed by Vite, normally `http://localhost:5173`.

## Demo accounts

Customer:

- Email: `customer@localroots.com`
- Password: `password123`

Seller:

- Email: `seller@localroots.com`
- Password: `password123`

Seller 2:

- Email: `seller2@localroots.com`
- Password: `password123`

## Connected flows

- Product list/detail → `/api/products`
- Product reviews → `/api/products/:id/reviews`
- Login/register → `/api/auth`
- Customer cart → `/api/cart`
- Checkout/orders → `/api/orders`
- Customer dashboard → `/api/orders/my-orders`
- Seller products → `/api/seller/products`
- Seller orders/stats → `/api/seller/*`
- Add product image → `multipart/form-data` to `/api/products`
- JWT is stored in browser local storage and sent as `Authorization: Bearer <token>`

No MongoDB connection string or JWT secret is included in the project. Configure them in `backend/.env`.
