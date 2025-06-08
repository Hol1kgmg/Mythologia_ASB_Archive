import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mythologia Admiral Ship Bridge",
  description: "神託のメソロギア 非公式ファンサイト - カード情報データベース・デッキ構築サポート",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
