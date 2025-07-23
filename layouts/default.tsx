import { Link } from "@heroui/link";

import { Head } from "./head";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Head />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-6">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3">
     Qida Dev
      </footer>
    </div>
  );
}
