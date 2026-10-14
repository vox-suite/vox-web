import Link from "next/link";

export function Breadcrumbs({ current }: { current: string }) {
  return <nav aria-label="Breadcrumb" className="site-breadcrumbs"><Link href="/">Vox</Link><span aria-hidden="true">/</span><span aria-current="page">{current}</span></nav>;
}
