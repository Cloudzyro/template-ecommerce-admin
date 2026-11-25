// Everything the back office shows lives in this file: the store, the menu,
// glazes, products, customers and orders. Change the text and numbers here,
// or replace these arrays with calls to your own API.
//
// All of it is fictional sample data.

export const store = {
  name: "Kilnhouse Ceramics",
  short: "Kilnhouse",
  domain: "kilnhouse.example",
  currency: "USD",
  // The day the sample data treats as today.
  today: "2026-11-25",
  staff: { name: "Ines Varga", role: "Owner", initials: "IV" },
  otherStores: ["Kilnhouse Wholesale"],
};

export type NavItem = { to: string; label: string; icon: "overview" | "orders" | "products" | "customers" };

export const nav: { group: string; items: NavItem[] }[] = [
  { group: "Store", items: [{ to: "/", label: "Overview", icon: "overview" }] },
  {
    group: "Sell",
    items: [
      { to: "/orders", label: "Orders", icon: "orders" },
      { to: "/products", label: "Products", icon: "products" },
      { to: "/customers", label: "Customers", icon: "customers" },
    ],
  },
];

// Glazes give each product variant its color. The swatch dot and the drawn
// product thumbnails both read from here.
export const glazes = {
  celadon: { name: "Celadon", color: "#9dbfae" },
  ash: { name: "Ash white", color: "#e6e2d8" },
  ironRed: { name: "Iron red", color: "#94412c" },
  tenmoku: { name: "Tenmoku", color: "#3b2b23" },
  shino: { name: "Shino", color: "#e6c4a1" },
  cobalt: { name: "Cobalt wash", color: "#46638f" },
  oatmeal: { name: "Oatmeal", color: "#d6c9b0" },
  moss: { name: "Moss", color: "#6f7b4c" },
} as const;

export type GlazeId = keyof typeof glazes;
export type Shape = "mug" | "bowl" | "plate" | "vase" | "pitcher" | "cup" | "platter" | "planter";

export type Variant = { glaze: GlazeId; sku: string; stock: number };
export type ProductStatus = "active" | "draft" | "archived";

export type Product = {
  id: string;
  title: string;
  shape: Shape;
  description: string;
  price: number;
  compareAt?: number;
  status: ProductStatus;
  collection: string;
  variants: Variant[];
  // Units sold in the last 30 days, for the top products list.
  sold30: number;
};

// Stock at or below this number counts as low.
export const lowStockAt = 5;

export const products: Product[] = [
  {
    id: "tide-mug",
    title: "Tide mug",
    shape: "mug",
    description: "A 12 oz wheel-thrown mug with a wide thumb rest. Dishwasher and microwave safe.",
    price: 34,
    status: "active",
    collection: "Everyday",
    variants: [
      { glaze: "celadon", sku: "KH-TM-CEL", stock: 42 },
      { glaze: "ash", sku: "KH-TM-ASH", stock: 18 },
      { glaze: "ironRed", sku: "KH-TM-IRR", stock: 3 },
    ],
    sold30: 96,
  },
  {
    id: "low-bowl",
    title: "Low serving bowl",
    shape: "bowl",
    description: "A wide, shallow bowl for salads and fruit, 10 in across.",
    price: 58,
    status: "active",
    collection: "Table",
    variants: [
      { glaze: "oatmeal", sku: "KH-LB-OAT", stock: 11 },
      { glaze: "tenmoku", sku: "KH-LB-TEN", stock: 4 },
    ],
    sold30: 41,
  },
  {
    id: "dinner-plate",
    title: "Dinner plate",
    shape: "plate",
    description: "A 10.5 in plate with a raw clay rim. Sold individually.",
    price: 38,
    compareAt: 44,
    status: "active",
    collection: "Table",
    variants: [
      { glaze: "ash", sku: "KH-DP-ASH", stock: 64 },
      { glaze: "celadon", sku: "KH-DP-CEL", stock: 27 },
      { glaze: "cobalt", sku: "KH-DP-COB", stock: 0 },
    ],
    sold30: 88,
  },
  {
    id: "bud-vase",
    title: "Bud vase",
    shape: "vase",
    description: "A narrow-necked vase for a single stem, about 6 in tall.",
    price: 26,
    status: "active",
    collection: "Home",
    variants: [
      { glaze: "shino", sku: "KH-BV-SHI", stock: 22 },
      { glaze: "moss", sku: "KH-BV-MOS", stock: 9 },
      { glaze: "ironRed", sku: "KH-BV-IRR", stock: 2 },
    ],
    sold30: 57,
  },
  {
    id: "pour-pitcher",
    title: "Pour pitcher",
    shape: "pitcher",
    description: "A 32 oz pitcher with a pulled spout that doesn't drip.",
    price: 72,
    status: "active",
    collection: "Table",
    variants: [
      { glaze: "celadon", sku: "KH-PP-CEL", stock: 6 },
      { glaze: "tenmoku", sku: "KH-PP-TEN", stock: 5 },
    ],
    sold30: 19,
  },
  {
    id: "espresso-cups",
    title: "Espresso cups, set of 2",
    shape: "cup",
    description: "Two 3 oz cups with no handle, thrown as a pair.",
    price: 40,
    status: "active",
    collection: "Everyday",
    variants: [
      { glaze: "tenmoku", sku: "KH-EC-TEN", stock: 31 },
      { glaze: "shino", sku: "KH-EC-SHI", stock: 14 },
    ],
    sold30: 63,
  },
  {
    id: "oval-platter",
    title: "Oval platter",
    shape: "platter",
    description: "A 16 in oval platter for roasts and shared plates.",
    price: 96,
    status: "active",
    collection: "Table",
    variants: [{ glaze: "ash", sku: "KH-OP-ASH", stock: 0 }],
    sold30: 12,
  },
  {
    id: "herb-planter",
    title: "Herb planter",
    shape: "planter",
    description: "A planter with a drainage hole and matching saucer, 5 in across.",
    price: 32,
    status: "active",
    collection: "Home",
    variants: [
      { glaze: "moss", sku: "KH-HP-MOS", stock: 25 },
      { glaze: "oatmeal", sku: "KH-HP-OAT", stock: 16 },
      { glaze: "cobalt", sku: "KH-HP-COB", stock: 8 },
    ],
    sold30: 34,
  },
  {
    id: "pasta-bowl",
    title: "Pasta bowl",
    shape: "bowl",
    description: "A deep 8.5 in bowl with a flared lip.",
    price: 36,
    status: "active",
    collection: "Table",
    variants: [
      { glaze: "cobalt", sku: "KH-PB-COB", stock: 20 },
      { glaze: "ash", sku: "KH-PB-ASH", stock: 37 },
    ],
    sold30: 52,
  },
  {
    id: "tall-vase",
    title: "Tall bottle vase",
    shape: "vase",
    description: "A 12 in bottle vase with a soft shoulder. Each one varies a little.",
    price: 118,
    status: "draft",
    collection: "Home",
    variants: [
      { glaze: "tenmoku", sku: "KH-TV-TEN", stock: 4 },
      { glaze: "celadon", sku: "KH-TV-CEL", stock: 3 },
    ],
    sold30: 0,
  },
  {
    id: "camp-mug",
    title: "Camp mug",
    shape: "mug",
    description: "A squat 10 oz mug with a raw clay base.",
    price: 30,
    status: "archived",
    collection: "Everyday",
    variants: [{ glaze: "oatmeal", sku: "KH-CM-OAT", stock: 0 }],
    sold30: 0,
  },
];

export const collections = ["Everyday", "Table", "Home"];

export type Customer = {
  id: string;
  name: string;
  email: string;
  city: string;
  since: string;
  note?: string;
  address: string[];
};

export const customers: Customer[] = [
  { id: "c-101", name: "Marisol Tran", email: "marisol.tran@example.com", city: "Portland, OR", since: "2024-03-12", address: ["2210 SE Alder St", "Portland, OR 97214"], note: "Prefers no gift receipt" },
  { id: "c-102", name: "Desmond Okafor", email: "d.okafor@example.com", city: "Atlanta, GA", since: "2025-01-08", address: ["48 Highland Ave NE", "Atlanta, GA 30307"] },
  { id: "c-103", name: "Hanna Lindqvist", email: "hanna.l@example.com", city: "Minneapolis, MN", since: "2023-11-20", address: ["915 W 36th St, Apt 3", "Minneapolis, MN 55408"], note: "Wholesale inquiry in October" },
  { id: "c-104", name: "Ravi Menon", email: "ravi.menon@example.com", city: "Austin, TX", since: "2025-06-02", address: ["1704 Kenwood Ave", "Austin, TX 78704"] },
  { id: "c-105", name: "Claire Dubois", email: "claire.dubois@example.com", city: "Brooklyn, NY", since: "2024-09-14", address: ["312 Prospect Pl", "Brooklyn, NY 11238"] },
  { id: "c-106", name: "Tomasz Nowak", email: "tnowak@example.com", city: "Chicago, IL", since: "2025-02-27", address: ["2620 N Wolcott Ave", "Chicago, IL 60614"] },
  { id: "c-107", name: "Ama Boateng", email: "ama.boateng@example.com", city: "Oakland, CA", since: "2024-05-30", address: ["538 Grand Ave", "Oakland, CA 94610"] },
  { id: "c-108", name: "Elliot Park", email: "elliot.park@example.com", city: "Seattle, WA", since: "2025-08-11", address: ["4419 Wallingford Ave N", "Seattle, WA 98103"] },
  { id: "c-109", name: "Lucia Ferreira", email: "lucia.f@example.com", city: "Providence, RI", since: "2024-12-03", address: ["77 Brook St", "Providence, RI 02906"] },
  { id: "c-110", name: "Noah Whitfield", email: "noah.whitfield@example.com", city: "Denver, CO", since: "2025-10-19", address: ["1350 Gaylord St", "Denver, CO 80206"] },
  { id: "c-111", name: "Priya Raman", email: "priya.raman@example.com", city: "Raleigh, NC", since: "2023-08-25", address: ["606 Wade Ave", "Raleigh, NC 27605"] },
  { id: "c-112", name: "Jonah Feld", email: "jonah.feld@example.com", city: "Philadelphia, PA", since: "2025-04-16", address: ["2014 Catharine St", "Philadelphia, PA 19146"] },
  { id: "c-113", name: "Sofia Alvarez", email: "sofia.alvarez@example.com", city: "Santa Fe, NM", since: "2024-07-07", address: ["421 Agua Fria St", "Santa Fe, NM 87501"] },
  { id: "c-114", name: "Grace Whitaker", email: "grace.w@example.com", city: "Burlington, VT", since: "2025-09-21", address: ["88 Loomis St", "Burlington, VT 05401"] },
];

export type PaymentStatus = "paid" | "pending" | "refunded";
export type FulfillmentStatus = "unfulfilled" | "fulfilled" | "returned";
export type LineItem = { productId: string; glaze: GlazeId; qty: number; price: number };
export type OrderEvent = { at: string; text: string };

export type Order = {
  id: string;
  customerId: string;
  placedAt: string;
  payment: PaymentStatus;
  fulfillment: FulfillmentStatus;
  items: LineItem[];
  shipping: number;
  taxRate: number;
  note?: string;
  events: OrderEvent[];
};

// Orders are generated from a fixed seed so the sample stays the same on
// every build. Replace this with your own orders array or API call.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildOrders(): Order[] {
  const rand = seeded(20261125);
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)];
  const sellable = products.filter((p) => p.status === "active");
  const out: Order[] = [];
  const start = Date.UTC(2026, 9, 1);
  const end = Date.UTC(2026, 10, 25, 16);
  const count = 150;
  for (let i = 0; i < count; i++) {
    const t = start + ((end - start) * (i + rand() * 0.6)) / count;
    const lines: LineItem[] = [];
    const n = 1 + Math.floor(rand() * 3);
    for (let j = 0; j < n; j++) {
      const p = pick(sellable);
      const v = pick(p.variants);
      if (lines.some((l) => l.productId === p.id && l.glaze === v.glaze)) continue;
      lines.push({ productId: p.id, glaze: v.glaze, qty: 1 + Math.floor(rand() * (p.price > 60 ? 1 : 3)), price: p.price });
    }
    const age = (end - t) / 86400000;
    const r = rand();
    let payment: PaymentStatus = "paid";
    let fulfillment: FulfillmentStatus = "fulfilled";
    if (age < 3) {
      fulfillment = "unfulfilled";
      payment = r < 0.25 ? "pending" : "paid";
    } else if (r < 0.06) {
      payment = "refunded";
      fulfillment = "returned";
    } else if (r < 0.1 && age < 9) {
      fulfillment = "unfulfilled";
    }
    const customer = pick(customers);
    const subtotal = lines.reduce((sum, l) => sum + l.qty * l.price, 0);
    const shipping = subtotal >= 100 ? 0 : 9;
    const total = Math.round((subtotal + shipping + subtotal * 0.07) * 100) / 100;
    const iso = (ms: number) => new Date(ms).toISOString();
    const events: OrderEvent[] = [{ at: iso(t), text: "Order placed on the online store" }];
    if (payment !== "pending") events.push({ at: iso(t + 60000), text: `Payment of $${total.toFixed(2)} captured by card` });
    else events.push({ at: iso(t + 60000), text: "Waiting for bank transfer" });
    events.push({ at: iso(t + 120000), text: `Confirmation email sent to ${customer.email}` });
    if (fulfillment !== "unfulfilled") {
      events.push({ at: iso(t + 86400000 * 1.2), text: "Packed in the studio" });
      events.push({ at: iso(t + 86400000 * 1.6), text: `Shipped with Parcel Post, tracking 9400 1106 ${String(4821 + i * 37).padStart(4, "0")} 22` });
    }
    if (fulfillment === "returned") {
      events.push({ at: iso(t + 86400000 * 6), text: "Return received: chipped in transit" });
      events.push({ at: iso(t + 86400000 * 6.2), text: "Refund issued to the original card" });
    }
    out.push({
      id: String(1201 + i),
      customerId: customer.id,
      placedAt: iso(t),
      payment,
      fulfillment,
      items: lines,
      shipping,
      taxRate: 0.07,
      note: i % 11 === 4 ? "Gift wrap please, it's a birthday present" : undefined,
      events,
    });
  }
  return out.reverse();
}

export const orders: Order[] = buildOrders();

// Daily revenue for the overview chart. Built from the orders above, so the
// chart and the table always agree.
export const chart = {
  title: "Revenue",
  thisMonth: "November",
  lastMonth: "October",
};
