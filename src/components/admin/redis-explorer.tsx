"use client";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Database,
  MoreVertical,
  Pencil,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CodeBlock,
  EmptyState,
  Field,
  LinkButton,
  LoadingState,
  Notice,
  Row,
  Stack,
  Text,
  TextArea,
} from "@/components/ui";
import {
  editableRedisType,
  expiry,
  formatValue,
  parseRedisEditor,
  type RedisPage,
  type RedisDetail,
} from "@/lib/redis";
import { cn } from "@/lib/utils";

async function request<T>(
  method: "GET" | "PUT" | "DELETE",
  url: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(url, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    signal,
    cache: "no-store",
  });
  const value = await response.json();
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Your session has ended. Sign in again to continue."
        : value.error || "Redis could not be loaded. Try again.",
    );
  return value;
}

export function RedisExplorer() {
  const [search, setSearch] = useState("vox:*");
  const [query, setQuery] = useState({
    match: "vox:*",
    cursor: "0",
    version: 0,
  });
  const [history, setHistory] = useState<string[]>([]);
  const [page, setPage] = useState<RedisPage | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [openKey, setOpenKey] = useState<string | null>(null);
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);

  const [detail, setDetail] = useState<RedisDetail | null>(null);
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editor, setEditor] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [mutationStatus, setMutationStatus] = useState("");
  const [mutating, setMutating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const detailRequest = useRef<AbortController | null>(null);
  const detailHeading = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    request<RedisPage>(
      "GET",
      `/api/admin/redis?${new URLSearchParams({ match: query.match, cursor: query.cursor })}`,
      undefined,
      controller.signal,
    )
      .then((value) => {
        if (!controller.signal.aborted) setPage(value);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query]);

  useEffect(() => () => detailRequest.current?.abort(), []);

  useEffect(() => {
    if (detail && openKey === detail.key) {
      detailHeading.current?.focus();
    }
  }, [detail, openKey]);

  useEffect(() => {
    if (!activeMenuKey) return;
    function handleDocumentClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-redis-menu-root]")) {
        setActiveMenuKey(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveMenuKey(null);
      }
    }
    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMenuKey]);

  function browse(cursor: string, match = query.match) {
    setLoading(true);
    setError("");
    setPage(null);
    setOpenKey(null);
    setActiveMenuKey(null);
    setDetail(null);
    setDetailError("");
    setDetailLoading(false);
    setEditing(false);
    setMutationError("");
    setMutationStatus("");
    setConfirmDelete(false);
    detailRequest.current?.abort();
    setQuery((previous) => ({ match, cursor, version: previous.version + 1 }));
  }

  async function inspect(
    key: string,
    startEditing = false,
    startDelete = false,
  ) {
    detailRequest.current?.abort();
    const controller = new AbortController();
    detailRequest.current = controller;
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    setEditing(startEditing);
    setMutationError("");
    setMutationStatus("");
    setConfirmDelete(startDelete);
    try {
      const value = await request<RedisDetail>(
        "GET",
        `/api/admin/redis?${new URLSearchParams({ key })}`,
        undefined,
        controller.signal,
      );
      if (!controller.signal.aborted) {
        setEditor(formatValue(value.value));
        setDetail(value);
        if (startEditing) setEditing(true);
        if (startDelete) setConfirmDelete(true);
      }
    } catch (error) {
      if (!controller.signal.aborted) setDetailError((error as Error).message);
    } finally {
      if (!controller.signal.aborted) setDetailLoading(false);
    }
  }

  async function toggleAccordion(key: string) {
    setActiveMenuKey(null);
    if (openKey === key) {
      setOpenKey(null);
      setDetail(null);
      setEditing(false);
      setConfirmDelete(false);
      setMutationError("");
      detailRequest.current?.abort();
    } else {
      setOpenKey(key);
      await inspect(key, false, false);
    }
  }

  async function openInEditMode(key: string) {
    setActiveMenuKey(null);
    setOpenKey(key);
    await inspect(key, true, false);
  }

  async function openInDeleteMode(key: string) {
    setActiveMenuKey(null);
    setOpenKey(key);
    await inspect(key, false, true);
  }

  async function save() {
    if (!detail) return;
    setMutationError("");
    setMutationStatus("");
    let value: unknown;
    try {
      value = parseRedisEditor(detail.type, editor);
    } catch (error) {
      setMutationError((error as Error).message);
      return;
    }
    setMutating(true);
    try {
      await request("PUT", "/api/admin/redis", {
        key: detail.key,
        type: detail.type,
        value,
      });
      await inspect(detail.key, false, false);
      setEditing(false);
      setMutationStatus("Redis entry updated.");
    } catch (error) {
      setMutationError((error as Error).message);
    } finally {
      setMutating(false);
    }
  }

  async function remove() {
    if (!detail) return;
    setMutating(true);
    setMutationError("");
    try {
      await request(
        "DELETE",
        `/api/admin/redis?${new URLSearchParams({ key: detail.key })}`,
      );
      setOpenKey(null);
      setDetail(null);
      setConfirmDelete(false);
      setMutationStatus("Redis entry deleted.");
      setLoading(true);
      setPage(null);
      setQuery((previous) => ({ ...previous, version: previous.version + 1 }));
    } catch (error) {
      setMutationError((error as Error).message);
    } finally {
      setMutating(false);
    }
  }

  return (
    <Stack gap="large">
      <Card>
        <Stack>
          <form
            className="flex flex-col gap-4 md:flex-row md:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              setHistory([]);
              browse("0", search || "*");
            }}
          >
            <div className="min-w-0 flex-1">
              <Field
                id="redis-search"
                name="match"
                label="Search keys"
                placeholder="vox:*"
                value={search}
                maxLength={256}
                onChange={(event) => setSearch(event.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button type="submit" disabled={loading}>
                <Search size={15} aria-hidden="true" />
                Search
              </Button>
              <Button
                variant="secondary"
                disabled={loading}
                onClick={() => {
                  setHistory([]);
                  browse("0");
                }}
              >
                <RefreshCw size={15} aria-hidden="true" />
                Refresh
              </Button>
            </div>
          </form>
          <Text muted small>
            Use * for any characters and ? for one character. Search * to browse
            all keys.
          </Text>
        </Stack>
      </Card>

      {error ? (
        <Notice title="Could not load entries" tone="error">
          <Stack gap="small">
            <Text>{error}</Text>
            <Row>
              <Button
                variant="secondary"
                disabled={loading}
                onClick={() => browse(query.cursor)}
              >
                <RefreshCw size={15} aria-hidden="true" />
                Try again
              </Button>
              <LinkButton href="/admin/diagnostics" variant="ghost">
                Check database diagnostics
              </LinkButton>
            </Row>
          </Stack>
        </Notice>
      ) : null}

      {mutationStatus ? (
        <Notice title="Success" tone="success">
          {mutationStatus}
        </Notice>
      ) : null}

      {loading ? (
        <Card>
          <LoadingState label="Scanning Redis keys…" />
        </Card>
      ) : (
        page && (
          <Stack gap="large">
            <Row spread>
              <Text muted small>
                {page.entries.length}{" "}
                {page.entries.length === 1 ? "entry" : "entries"} on this scan
                page
              </Text>
              <Badge tone="accent">Editable</Badge>
            </Row>

            {page.entries.length ? (
              <div
                className="flex flex-col gap-2"
                role="region"
                aria-label="Redis keys accordion"
              >
                {page.entries.map((entry, index) => {
                  const isExpanded = openKey === entry.key;
                  const isMenuOpen = activeMenuKey === entry.key;

                  return (
                    <div
                      key={entry.key}
                      className={cn(
                        "overflow-hidden rounded-2xl border border-border-edge bg-ink shadow-subtle-3 transition-colors",
                        isExpanded && "border-smoke/40",
                      )}
                    >
                      <div className="flex items-center gap-2 px-4 py-3">
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md text-left transition-colors hover:bg-graphite/60"
                          onClick={() => void toggleAccordion(entry.key)}
                          aria-label={entry.key}
                          aria-expanded={isExpanded}
                          aria-controls={`redis-panel-${index}`}
                        >
                          <span
                            className="shrink-0 text-ash"
                            aria-hidden="true"
                          >
                            {isExpanded ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </span>
                          <span className="truncate font-mono text-sm text-mist">
                            {entry.key}
                          </span>
                        </button>

                        <div className="flex shrink-0 items-center gap-2">
                          <Badge tone="neutral">{entry.type}</Badge>
                          <div className="relative" data-redis-menu-root>
                            <button
                              type="button"
                              className="rounded-md p-1.5 text-ash transition-colors hover:bg-obsidian hover:text-pure-white"
                              aria-label={`Actions for ${entry.key}`}
                              aria-haspopup="menu"
                              aria-expanded={isMenuOpen}
                              onClick={() => {
                                setActiveMenuKey(
                                  isMenuOpen ? null : entry.key,
                                );
                              }}
                            >
                              <MoreVertical size={16} aria-hidden="true" />
                            </button>

                            {isMenuOpen && (
                              <div
                                className="absolute right-0 top-full z-20 mt-1 min-w-[11rem] rounded-md border border-border-edge bg-graphite py-1 shadow-subtle-3"
                                role="menu"
                                aria-label="Key actions"
                              >
                                {editableRedisType(entry.type) && (
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-mist transition-colors hover:bg-obsidian"
                                    onClick={() =>
                                      void openInEditMode(entry.key)
                                    }
                                  >
                                    <Pencil size={14} aria-hidden="true" />
                                    <span>Edit entry</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-coral-pulse transition-colors hover:bg-ember-hush"
                                  onClick={() =>
                                    void openInDeleteMode(entry.key)
                                  }
                                >
                                  <Trash2 size={14} aria-hidden="true" />
                                  <span>Delete entry</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div
                          id={`redis-panel-${index}`}
                          className="border-t border-border-edge bg-obsidian px-4 py-4"
                        >
                          {detailLoading && (
                            <LoadingState label="Reading entry…" />
                          )}

                          {detailError && (
                            <Notice
                              title="Could not read this entry"
                              tone="error"
                            >
                              {detailError}
                            </Notice>
                          )}

                          {detail && detail.key === entry.key && (
                            <Stack>
                              <div className="flex items-start justify-between gap-3">
                                <h2
                                  ref={detailHeading}
                                  tabIndex={-1}
                                  className="min-w-0 break-all font-mono text-base text-pure-white"
                                >
                                  {detail.key}
                                </h2>
                                <Button
                                  variant="ghost"
                                  aria-label="Close entry preview"
                                  onClick={() => {
                                    setOpenKey(null);
                                    setDetail(null);
                                    setEditing(false);
                                    setConfirmDelete(false);
                                  }}
                                >
                                  <X size={17} aria-hidden="true" />
                                </Button>
                              </div>

                              {detail.type === "none" ? (
                                <EmptyState
                                  title="This entry is no longer available"
                                  description="It may have expired or been removed since the last scan. Refresh to see the current entries."
                                />
                              ) : (
                                <>
                                  <dl className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-md border border-border-edge bg-ink p-3">
                                      <dt className="font-mono text-[10px] uppercase tracking-wide text-smoke">
                                        Type
                                      </dt>
                                      <dd className="mt-1">
                                        <Badge tone="accent">
                                          {detail.type}
                                        </Badge>
                                      </dd>
                                    </div>
                                    <div className="rounded-md border border-border-edge bg-ink p-3">
                                      <dt className="font-mono text-[10px] uppercase tracking-wide text-smoke">
                                        Expiry at read time
                                      </dt>
                                      <dd className="mt-1 font-mono text-sm text-mist">
                                        {expiry(detail.ttl)}
                                      </dd>
                                    </div>
                                    <div className="rounded-md border border-border-edge bg-ink p-3">
                                      <dt className="font-mono text-[10px] uppercase tracking-wide text-smoke">
                                        Size
                                      </dt>
                                      <dd className="mt-1 font-mono text-sm text-mist">
                                        {detail.size.toLocaleString()}{" "}
                                        {detail.type === "string"
                                          ? "bytes"
                                          : "items"}
                                      </dd>
                                    </div>
                                  </dl>

                                  {detail.truncated && (
                                    <Notice title="Showing a bounded preview">
                                      This entry exceeds the preview limit. The
                                      value below is incomplete.
                                    </Notice>
                                  )}

                                  {editing ? (
                                    <Stack>
                                      <TextArea
                                        id="redis-value"
                                        label="Redis value"
                                        hint={
                                          detail.type === "string"
                                            ? "The text is saved exactly as entered."
                                            : detail.type === "hash"
                                              ? "Enter alternating field and value strings as a JSON array."
                                              : detail.type === "zset"
                                                ? "Enter alternating member and score values as a JSON array."
                                                : "Enter string values as a JSON array."
                                        }
                                        value={editor}
                                        rows={12}
                                        monospace
                                        disabled={mutating}
                                        onChange={(event) =>
                                          setEditor(event.target.value)
                                        }
                                      />
                                      <Row>
                                        <Button
                                          disabled={mutating}
                                          onClick={() => void save()}
                                        >
                                          <Save size={15} aria-hidden="true" />
                                          {mutating
                                            ? "Saving…"
                                            : "Save changes"}
                                        </Button>
                                        <Button
                                          variant="secondary"
                                          disabled={mutating}
                                          onClick={() => {
                                            setEditor(
                                              formatValue(detail.value),
                                            );
                                            setEditing(false);
                                            setMutationError("");
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                      </Row>
                                    </Stack>
                                  ) : (
                                    <CodeBlock>
                                      {formatValue(detail.value)}
                                    </CodeBlock>
                                  )}

                                  {mutationError && (
                                    <Notice
                                      title="Could not update this entry"
                                      tone="error"
                                    >
                                      {mutationError}
                                    </Notice>
                                  )}

                                  {!editing && (
                                    <Row>
                                      {editableRedisType(detail.type) &&
                                        !detail.truncated && (
                                          <Button
                                            variant="secondary"
                                            onClick={() => {
                                              setMutationError("");
                                              setMutationStatus("");
                                              setEditing(true);
                                            }}
                                          >
                                            <Pencil
                                              size={15}
                                              aria-hidden="true"
                                            />
                                            Edit value
                                          </Button>
                                        )}
                                      <Button
                                        variant="danger"
                                        onClick={() => setConfirmDelete(true)}
                                      >
                                        <Trash2
                                          size={15}
                                          aria-hidden="true"
                                        />
                                        Delete entry
                                      </Button>
                                    </Row>
                                  )}

                                  {confirmDelete && (
                                    <Notice
                                      title="Delete this Redis entry?"
                                      tone="error"
                                    >
                                      <Stack gap="small">
                                        <Text>
                                          This permanently removes {detail.key}.
                                          This action cannot be undone.
                                        </Text>
                                        <Row>
                                          <Button
                                            variant="danger"
                                            disabled={mutating}
                                            onClick={() => void remove()}
                                          >
                                            {mutating
                                              ? "Deleting…"
                                              : "Confirm delete"}
                                          </Button>
                                          <Button
                                            variant="secondary"
                                            disabled={mutating}
                                            onClick={() =>
                                              setConfirmDelete(false)
                                            }
                                          >
                                            Keep entry
                                          </Button>
                                        </Row>
                                      </Stack>
                                    </Notice>
                                  )}

                                  <Text muted small>
                                    Strings: up to 64 KiB. Collections: a
                                    sample, with long values shortened. Hashes
                                    and sorted sets show alternating field/value
                                    or member/score pairs. Non-UTF-8 value bytes
                                    display as replacement characters.
                                  </Text>
                                </>
                              )}
                            </Stack>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <Card>
                <EmptyState
                  icon={<Database size={22} />}
                  title={
                    page.cursor === "0"
                      ? "No entries on this page"
                      : "No matches in this scan batch"
                  }
                  description={
                    page.cursor === "0"
                      ? "This scan is complete. Try a different pattern, or refresh to read again."
                      : "Redis scans incrementally. Continue to the next batch to look for matching keys."
                  }
                />
              </Card>
            )}

            <Row spread>
              <Text muted small>
                {page.cursor === "0"
                  ? "End of scan."
                  : "More keys may be available."}{" "}
                Results can change while Redis is updated.
              </Text>
              <Row>
                <Button
                  variant="secondary"
                  disabled={!history.length}
                  onClick={() => {
                    const previous = history.at(-1)!;
                    setHistory(history.slice(0, -1));
                    browse(previous);
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={page.cursor === "0"}
                  onClick={() => {
                    setHistory([...history, query.cursor]);
                    browse(page.cursor);
                  }}
                >
                  Next batch
                </Button>
              </Row>
            </Row>
          </Stack>
        )
      )}
    </Stack>
  );
}
