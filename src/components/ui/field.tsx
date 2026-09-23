import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";

export function Field({
  label,
  hint,
  id,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...props}
      />
      {hint ? (
        <small id={`${id}-hint`} className="text-xs text-smoke">
          {hint}
        </small>
      ) : null}
    </div>
  );
}

export function TextArea({
  label,
  hint,
  id,
  monospace = false,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  hint?: string;
  monospace?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={cn(monospace && "font-mono text-sm")}
        {...props}
      />
      {hint ? (
        <small id={`${id}-hint`} className="text-xs text-smoke">
          {hint}
        </small>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  id,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className="h-10 w-full rounded-md border border-transparent bg-white/5 px-3 text-base text-pure-white outline-none focus-visible:border-border-edge focus-visible:ring-2 focus-visible:ring-ash/30"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
