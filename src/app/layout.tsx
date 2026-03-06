import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Karteikarten Studio",
  description: "Erstelle und drucke deine Lernkarten",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, background: "#0c0f14" }}>{children}</body>
    </html>
  );
}
