import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
const [slug, title] = process.argv.slice(2);
if (!slug || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(slug) || !title?.trim()) {
  console.error('Usage: npm run generate:page -- schedules "Schedules"');
  process.exit(1);
}
const root = resolve(import.meta.dirname, "..");
const file = resolve(root, `src/app/admin/(console)/${slug}/page.tsx`);
const registry = resolve(root, "src/lib/admin-modules.ts");
if (existsSync(file) || ["login", "api"].includes(slug)) {
  console.error("That page already exists or is reserved.");
  process.exit(1);
}
const modules = readFileSync(registry, "utf8");
if (!modules.includes("\n];")) {
  console.error("Module registry format changed. Register this page manually.");
  process.exit(1);
}
const source = `import { Card, EmptyState, Page } from '@/components/ui';\nimport { requireSuperuser } from '@/lib/auth';\n\nexport default async function ManagementPage() {\n  await requireSuperuser();\n  return <Page title={${JSON.stringify(title)}} description="Manage your workspace."><Card><EmptyState title="Nothing here yet" description="Your data will appear here once this module is connected."/></Card></Page>;\n}\n`;
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, source);
writeFileSync(
  registry,
  modules.replace(
    "\n];",
    `\n  ${JSON.stringify({ slug, title, description: `Manage ${title.toLowerCase()} in your workspace.`, icon: "module" })},\n];`,
  ),
);
console.log(
  `Created ${file}\nAdded navigation. Connect your data through a server-authorized endpoint.`,
);
