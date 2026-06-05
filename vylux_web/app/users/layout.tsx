import type { Metadata } from "next";


import Header from "./components/header/page";
import Footer from "./components/footer/page";

export const metadata: Metadata = {
  title: "VYLUX Dealer Portal",
  description: "VYLUX Lighting Dealer Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="layoutWrapper">
          <Header />

          <main className="mainContent">
            {children}
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}