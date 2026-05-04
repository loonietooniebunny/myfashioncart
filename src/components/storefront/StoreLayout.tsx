import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";

export const StoreLayout = ({ children, transparentNav = false }: { children: ReactNode; transparentNav?: boolean }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <CartDrawer />
    <main className={transparentNav ? "" : "pt-16 md:pt-20"}>{children}</main>
    <Footer />
  </div>
);
