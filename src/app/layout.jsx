import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "../context/AuthContext";
import BarraNavegacion from "../components/Navbar";
import LayoutWrapper from "./layout-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hospeda+ - Gestión Hotelera",
  description: "Sistema de gestión hotelera hospeda+"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <LayoutWrapper>
            <BarraNavegacion />
            <main className="container" style={{ paddingTop: '3.75rem' }}>{children}</main>
            {/* <main className="container">{children}</main> */}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
