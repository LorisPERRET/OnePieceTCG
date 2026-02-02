import { NavTabs } from "../components/shared/NavTabs";

export default function CardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            🏴‍☠️ One Piece Card Manager
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Gérez votre collection et analysez vos decks
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <NavTabs />
        {children}
      </main>
    </div>
  );
}