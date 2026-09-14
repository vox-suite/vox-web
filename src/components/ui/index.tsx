import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { ArrowUpRight, Waves } from "lucide-react";

type Children = { children: ReactNode };
export function Stack({
  children,
  gap = "normal",
}: Children & { gap?: "small" | "normal" | "large" }) {
  return (
    <div className="ui-stack" data-gap={gap}>
      {children}
    </div>
  );
}
export function Row({
  children,
  spread = false,
}: Children & { spread?: boolean }) {
  return (
    <div className="ui-row" data-spread={spread}>
      {children}
    </div>
  );
}
export function Grid({
  children,
  columns = 3,
}: Children & { columns?: 2 | 3 | 4 }) {
  return (
    <div className="ui-grid" data-columns={columns}>
      {children}
    </div>
  );
}
export function Page({
  title,
  description,
  actions,
  children,
}: Children & { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="ui-page">
      <header className="ui-page-heading">
        <div>
          <p className="ui-kicker">Vox workspace</p>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions && <Row>{actions}</Row>}
      </header>
      <Stack gap="large">{children}</Stack>
    </div>
  );
}
export function Section({
  title,
  description,
  children,
  id,
}: Children & { title?: string; description?: string; id?: string }) {
  return (
    <section id={id} className="ui-section">
      {title && (
        <header className="ui-section-heading">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
export function Card({
  children,
  title,
  description,
  tone = "plain",
}: Children & {
  title?: string;
  description?: string;
  tone?: "plain" | "lavender" | "peach" | "green";
}) {
  return (
    <section className="ui-card" data-tone={tone}>
      {title && (
        <header className="ui-card-heading">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
export function Text({
  children,
  muted = false,
  small = false,
}: Children & { muted?: boolean; small?: boolean }) {
  return (
    <p className="ui-text" data-muted={muted} data-small={small}>
      {children}
    </p>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: Children & { tone?: "neutral" | "positive" | "accent" | "warning" }) {
  return (
    <span className="ui-badge" data-tone={tone}>
      {children}
    </span>
  );
}
export function Button({
  children,
  variant = "primary",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button type={type} className="ui-button" data-variant={variant} {...props}>
      {children}
    </button>
  );
}
export function LinkButton({
  children,
  href,
  variant = "primary",
}: Children & { href: string; variant?: "primary" | "secondary" | "ghost" }) {
  return (
    <Link href={href} className="ui-button" data-variant={variant}>
      {children}
    </Link>
  );
}
export function Field({
  label,
  hint,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className="ui-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...props}
      />
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
export function Select({
  label,
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { id: string; label: string }) {
  return (
    <div className="ui-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} {...props}>
        {children}
      </select>
    </div>
  );
}
export function Notice({
  title,
  children,
  tone = "info",
}: Children & { title: string; tone?: "info" | "error" | "success" }) {
  return (
    <div
      className="ui-notice"
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
    >
      <strong>{title}</strong>
      <div>{children}</div>
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="ui-empty">
      {icon && <span className="ui-icon-well">{icon}</span>}
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function DataTable({
  caption,
  headings,
  children,
}: Children & { caption: string; headings: string[] }) {
  return (
    <div
      className="ui-table-scroll"
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {headings.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="ui-code" tabIndex={0}>
      <code>{children}</code>
    </pre>
  );
}
export function Stat({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <p className="ui-stat-label">{label}</p>
      <p className="ui-stat-value">{value}</p>
      <Text muted small>
        {description}
      </Text>
    </Card>
  );
}
export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link className="brand" href={href} aria-label="Vox home">
      <Waves aria-hidden="true" size={25} />
      <span>vox</span>
    </Link>
  );
}
export function ModuleCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <Link href={href} className="ui-module-card">
      <span className="ui-icon-well">{icon}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <span className="ui-module-link">
        Open {title.toLowerCase()} <ArrowUpRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}
export function LoadingState({
  label = "Loading workspace…",
}: {
  label?: string;
}) {
  return (
    <div className="ui-empty" role="status">
      <span className="ui-loading" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
export function AuthFrame({ children }: Children) {
  return (
    <main id="main" className="auth-frame">
      <Brand />
      <div className="auth-card">{children}</div>
      <Text muted small>
        Vox administration · Access by invitation
      </Text>
    </main>
  );
}
export function ColorSwatches() {
  return (
    <div className="ui-swatches">
      {["paper", "ink", "lavender", "peach", "green"].map((tone) => (
        <div key={tone}>
          <span data-swatch={tone} />
          <small>{tone}</small>
        </div>
      ))}
    </div>
  );
}
