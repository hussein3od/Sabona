import { lazy, Suspense } from "react";
import { Link, Route, Routes } from "react-router-dom";

const LandingPage = lazy(() => import("./pages/landing"));
const Home = lazy(() => import("./pages/home"));
const Signup = lazy(() => import("./pages/signup"));
const Login = lazy(() => import("./pages/login"));
const Profile = lazy(() => import("./pages/profile"));
const Wishlist = lazy(() => import("./pages/wishlist"));
const Cart = lazy(() => import("./pages/cart"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Checkout = lazy(() => import("./pages/checkout"));
const Orders = lazy(() => import("./pages/orders"));
const Admin = lazy(() => import("./pages/adminDashboard"));
const AdminProducts = lazy(() => import("./pages/adminProducts"));
const AdminAddProduct = lazy(() => import("./pages/adminAddProduct"));
const AdminEditProduct = lazy(() => import("./pages/adminEditProduct"));
const AdminOrders = lazy(() => import("./pages/adminOrders"));
const Contact = lazy(() => import("./pages/contact"));

function App() {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          className="flex min-h-screen items-center justify-center bg-[#faf9f2] text-sm text-[#737a72]"
        >
          Loading...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<Orders />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/new" element={<AdminAddProduct />} />
        <Route path="/admin/products/edit/:id" element={<AdminEditProduct />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="*"
          element={
            <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f2] px-4 text-center text-[#173d2b]">
              <h1 className="font-serif text-4xl">Page not found</h1>
              <Link className="mt-4 underline" to="/">
                Return to home
              </Link>
            </main>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;