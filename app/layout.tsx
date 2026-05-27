import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Quizly — Crie e jogue quizzes",
  description: "Plataforma aberta de criação e resposta de quizzes. Qualquer tema, qualquer pessoa.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${nunito.variable} font-nunito antialiased`}>
        {children}
      </body>
    </html>
  );
}