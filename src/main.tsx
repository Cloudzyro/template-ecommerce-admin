import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router";
import { Layout } from "./components/Layout";
import "./index.css";
import { StoreProvider } from "./lib/state";
import { CustomerDetail } from "./pages/CustomerDetail";
import { Customers } from "./pages/Customers";
import { NotFound } from "./pages/NotFound";
import { OrderDetail } from "./pages/OrderDetail";
import { Orders } from "./pages/Orders";
import { Overview } from "./pages/Overview";
import { ProductEdit } from "./pages/ProductEdit";
import { Products } from "./pages/Products";

// A hash router keeps every address after a "#" (for example /#/orders/1250),
// so the server only ever has to send index.html. Deep links and refreshes
// work on any static host with no rewrite rules.
const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Overview /> },
      { path: "/orders", element: <Orders /> },
      { path: "/orders/:id", element: <OrderDetail /> },
      { path: "/products", element: <Products /> },
      { path: "/products/:id", element: <ProductEdit /> },
      { path: "/customers", element: <Customers /> },
      { path: "/customers/:id", element: <CustomerDetail /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  </StrictMode>,
);
