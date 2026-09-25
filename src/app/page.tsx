import { UploadBox } from "@/components/upload-box";
import { Logo, Features, AdPlaceholder } from "@/components/branding";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20">
      <div className="animate-fade-in flex flex-col items-center gap-8 w-full">
        <Logo />

        <div className="text-center space-y-3 max-w-lg">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100">
            Share PDFs that
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              {" "}disappear
            </span>
          </h1>
          <p className="text-lg text-zinc-500 max-w-md mx-auto">
            Upload a PDF, get a secure link. Choose how long it lives — then it
            self-destructs.
          </p>
        </div>

        <UploadBox />

        <Features />

        <footer className="mt-16 flex flex-col items-center gap-6 w-full max-w-3xl px-4">
          <AdPlaceholder className="w-full h-24" />

          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-zinc-600">
            <p>No accounts. No tracking. No trace of your data.</p>
            <span className="hidden sm:inline">|</span>
            <p>
              All files are encrypted client-side with AES-256-GCM.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-700">
            <a href="#" className="hover:text-zinc-500 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-zinc-500 transition-colors">
              Terms
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
