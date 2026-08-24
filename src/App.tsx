import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/store/cart";
import { SkipLink } from "@/components/SkipLink";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminGuard } from "@/components/AdminGuard";
import { lazyWithChunkRecovery } from "@/lib/chunk-recovery";

// Keep primary storefront routes eager to avoid white Suspense swaps on iOS.
const ProductPage = lazyWithChunkRecovery(() => import("./pages/ProductPage"));
const Checkout = lazyWithChunkRecovery(() => import("./pages/Checkout"));
const CheckoutSuccess = lazyWithChunkRecovery(() => import("./pages/CheckoutSuccess"));
const Payment = lazyWithChunkRecovery(() => import("./pages/Payment"));
const PaymentSuccess = lazyWithChunkRecovery(() => import("./pages/PaymentSuccess"));
const PaymentCancel = lazyWithChunkRecovery(() => import("./pages/PaymentCancel"));
const About = lazyWithChunkRecovery(() => import("./pages/About"));
const Contact = lazyWithChunkRecovery(() => import("./pages/Contact"));
const Login = lazyWithChunkRecovery(() => import("./pages/Login"));
const Register = lazyWithChunkRecovery(() => import("./pages/Register"));
const Favorites = lazyWithChunkRecovery(() => import("./pages/Favorites"));
const NotFound = lazyWithChunkRecovery(() => import("./pages/NotFound"));

// Admin pages
const AdminDashboard = lazyWithChunkRecovery(() => import("./pages/admin/Dashboard"));
const ProductsManagement = lazyWithChunkRecovery(() => import("./pages/admin/ProductsManagement"));
const ProductEdit = lazyWithChunkRecovery(() => import("./pages/admin/ProductEdit"));
const AdminOrders = lazyWithChunkRecovery(() => import("./pages/admin/Orders"));
const AdminOrderDetail = lazyWithChunkRecovery(() => import("./pages/admin/OrderDetail"));
const AdminUsers = lazyWithChunkRecovery(() => import("./pages/admin/Users"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent absolute inset-0"></div>
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">Загрузка...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <SkipLink />
      <CartProvider>
        <TooltipProvider>
          <Toaster position="bottom-center" />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/favorites" element={<Favorites />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                <Route path="/admin/products" element={<AdminGuard><ProductsManagement /></AdminGuard>} />
                <Route path="/admin/products/new" element={<AdminGuard><ProductEdit /></AdminGuard>} />
                <Route path="/admin/products/edit/:id" element={<AdminGuard><ProductEdit /></AdminGuard>} />
                <Route path="/admin/orders" element={<AdminGuard><AdminOrders /></AdminGuard>} />
                <Route path="/admin/orders/:id" element={<AdminGuard><AdminOrderDetail /></AdminGuard>} />
                <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
