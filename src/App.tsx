import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CatalogSidebar } from "@/components/CatalogSidebar";
import { useCatalog } from "@/hooks/use-catalog";
import Index from "./pages/Index.tsx";
import Catalog from "./pages/Catalog.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import Checkout from "./pages/Checkout.tsx";
import CheckoutSuccess from "./pages/CheckoutSuccess.tsx";
import Payment from "./pages/Payment.tsx";
import PaymentSuccess from "./pages/PaymentSuccess.tsx";
import PaymentCancel from "./pages/PaymentCancel.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import Products from "./pages/admin/Products.tsx";
import Orders from "./pages/admin/Orders.tsx";
import Users from "./pages/admin/Users.tsx";
import { AdminRoute } from "./components/AdminRoute.tsx";
import { CartProvider } from "@/store/cart";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isOpen, close } = useCatalog();

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <Products />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <Orders />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CatalogSidebar isOpen={isOpen} onClose={close} />
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
