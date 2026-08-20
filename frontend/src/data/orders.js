export const customerOrders = [
  {
    id: "LR10231",
    date: "3 Aug 2026",
    products: [{ productId: "p1", name: "Mango Pickle (Aam ka Achaar)", qty: 2, price: 220 }],
    amount: 440,
    status: "Delivered",
  },
  {
    id: "LR10245",
    date: "5 Aug 2026",
    products: [{ productId: "p3", name: "Eggless Chocolate Truffle Cake", qty: 1, price: 650 }],
    amount: 650,
    status: "Preparing",
  },
  {
    id: "LR10250",
    date: "7 Aug 2026",
    products: [
      { productId: "p7", name: "Lavender Soy Candle", qty: 1, price: 320 },
      { productId: "p8", name: "Citrus Grove Jar Candle", qty: 1, price: 300 },
    ],
    amount: 620,
    status: "Accepted",
  },
  {
    id: "LR10198",
    date: "28 Jul 2026",
    products: [{ productId: "p11", name: "Stoneware Coffee Mug Set", qty: 1, price: 680 }],
    amount: 680,
    status: "Delivered",
  },
];

export const sellerOrders = [
  {
    id: "LR10231",
    customer: "Amit Kapoor",
    productId: "p1",
    product: "Mango Pickle (Aam ka Achaar)",
    qty: 2,
    amount: 440,
    status: "Delivered",
  },
  {
    id: "LR10262",
    customer: "Divya Sen",
    productId: "p2",
    product: "Homemade Moong Dal Papad",
    qty: 3,
    amount: 450,
    status: "Pending",
  },
  {
    id: "LR10267",
    customer: "Rahul Nair",
    productId: "p1",
    product: "Mango Pickle (Aam ka Achaar)",
    qty: 1,
    amount: 220,
    status: "Accepted",
  },
  {
    id: "LR10271",
    customer: "Fatima Khan",
    productId: "p16",
    product: "Homestyle Rajma Masala (Frozen Pack)",
    qty: 2,
    amount: 360,
    status: "Preparing",
  },
  {
    id: "LR10275",
    customer: "Suresh Yadav",
    productId: "p2",
    product: "Homemade Moong Dal Papad",
    qty: 1,
    amount: 150,
    status: "Ready",
  },
];

export const orderStatusFlow = ["Pending", "Accepted", "Preparing", "Ready", "Delivered"];
