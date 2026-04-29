"use client";

import { WishlistPage as WishlistPageComponent } from "@/components/wishlist";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function WishlistPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <WishlistPageComponent />
      </main>
      <Footer />
    </div>
  );
}
