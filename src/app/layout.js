import "./globals.css";
import Shell from "@/components/Shell";
export const metadata = { title: "ConectaIA Pro", description: "ConectaIA Pro — soluciones de inteligencia artificial para empresas. Creadores de BellaOS." };
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body><Shell>{children}</Shell></body>
    </html>
  );
}
