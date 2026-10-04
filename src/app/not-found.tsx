import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-6 text-center">
      <div>
        <h1 className="text-[clamp(3rem,8vw,6rem)] leading-none">Wrong number.</h1>
        <p className="mt-4">This page isn’t here.</p>
        <Link href="/" className="btn-pill-primary mt-8">
          Back to Vox
        </Link>
      </div>
    </main>
  );
}
