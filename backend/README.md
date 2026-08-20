# LocalRoots Backend

Node.js + Express + MongoDB API for the LocalRoots hyperlocal marketplace.

## Setup

```bash
cd backend
npm install
cp .env.example .env      # then edit .env (at minimum set MONGO_URI and JWT_SECRET)
npm run seed               # populates demo users + products
npm run dev                 # starts the API on http://localhost:5000
```

Requires a running MongoDB instance (local `mongod` on port 27017, or a MongoDB Atlas
connection string in `MONGO_URI`).

### Demo logins (after `npm run seed`)

| Role     | Email                     | Password    |
|----------|---------------------------|-------------|
| Customer | customer@localroots.com   | password123 |
| Seller   | seller@localroots.com     | password123 |
| Seller 2 | seller2@localroots.com    | password123 |

### Image uploads

If `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` are left blank
in `.env`, uploaded product images are stored locally in `backend/uploads/` and served from
`http://localhost:5000/uploads/...` instead — no Cloudinary account is required to run the app.

## Models

- **User** — name, email, password (hashed), phone, role (`customer`/`seller`), profileImage, location `{ city, latitude, longitude }`, storeName/storeBio (sellers)
- **Product** — name, description, price, unit, category, images[], stock, seller (ref User), city, location (GeoJSON Point, 2dsphere-indexed), rating, reviewCount, deliveryAvailable
- **Cart** — one per user, items `[{ product, quantity, price }]`
- **Order** — customer, items `[{ product, seller, productName, quantity, price, status }]`, deliveryAddress, subtotal, deliveryFee, totalAmount, paymentMethod, paymentStatus, status
- **Review** — user, product, order (proof of purchase), rating, comment — unique per (user, product, order)

## API Endpoints

All responses follow `{ success, message, data }`.

### Auth
- `POST /api/auth/register` — `{ name, email, password, phone?, role?, city?, latitude?, longitude? }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/auth/me` — requires Bearer token

### Products
- `GET /api/products` — `?search=&category=&city=&minPrice=&maxPrice=&page=&limit=`
- `GET /api/products/nearby` — `?lat=&lng=&radius=(km)&category=`
- `GET /api/products/:id`
- `POST /api/products` — seller only, `multipart/form-data` with `images` field (up to 5 files)
- `PUT /api/products/:id` — seller only, must own the product
- `DELETE /api/products/:id` — seller only, must own the product
- `GET /api/products/:id/reviews`
- `POST /api/products/:id/reviews` — customer only, `{ rating, comment, orderId }`, requires a delivered order

### Cart (customer only)
- `GET /api/cart`
- `POST /api/cart/items` — `{ productId, quantity }`
- `PUT /api/cart/items/:productId` — `{ quantity }`
- `DELETE /api/cart/items/:productId`
- `DELETE /api/cart`

### Orders
- `POST /api/orders` — customer only, `{ deliveryAddress: { name, phone, address, city, pincode }, paymentMethod }`. Total is always calculated server-side from live product prices; stock is validated and decremented.
- `GET /api/orders/my-orders` — customer only
- `GET /api/orders/:id` — accessible by the owning customer or an involved seller
- `GET /api/orders/seller` — seller only, scoped to that seller's line items
- `PATCH /api/orders/:id/status` — seller only, `{ status }`, applies to that seller's items in the order

### Seller dashboard (seller only)
- `GET /api/seller/products`
- `GET /api/seller/orders`
- `GET /api/seller/stats` — `{ totalProducts, totalOrders, pendingOrders, totalRevenue }`

### Customer dashboard (customer only)
- `GET /api/customer/stats` — `{ totalOrders, activeOrders, completedOrders }`

## Notes / limitations

- Stock is decremented with per-document atomic guards (not a multi-document transaction),
  since transactions require a MongoDB replica set and the default local setup is standalone.
  A failure partway through an order rolls back any stock already decremented.
- Payment is simulated only (`COD` / `DEMO_ONLINE`) — no real payment gateway is integrated.
