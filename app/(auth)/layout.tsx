import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#B8D9F5] flex flex-col">
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <Image src="/trophy-transparent.png" alt="trophy" width={18} height={38} className="object-contain" unoptimized />
          <span className="text-xl font-black tracking-tighter text-foreground">
            FULL<span className="text-green-600">TIME</span>
          </span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
