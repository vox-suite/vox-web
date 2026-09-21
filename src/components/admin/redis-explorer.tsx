"use client";
import { useEffect, useRef, useState } from "react";
import {
  Database,
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
  DataTable,
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
    if (detail) detailHeading.current?.focus();
  }, [detail]);
  function browse(cursor: string, match = query.match) {
    setLoading(true);
    setError("");
    setPage(null);
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
  async function inspect(key: string) {
    detailRequest.current?.abort();
    const controller = new AbortController();
    detailRequest.current = controller;
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    setEditing(false);
    setMutationError("");
    setMutationStatus("");
    setConfirmDelete(false);
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
      }
    } catch (error) {
      if (!controller.signal.aborted) setDetailError((error as Error).message);
    } finally {
      if (!controller.signal.aborted) setDetailLoading(false);
    }
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
      await inspect(detail.key);
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
            className="redis-search"
            onSubmit={(event) => {
              event.preventDefault();
              setHistory([]);
              browse("0", search || "*");
            }}
          >
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
              <Button variant="secondary" onClick={() => browse(query.cursor)}>
                Try again
              </Button>
              {error.includes("session") && (
                <LinkButton
                  href={
                    typeof window !== "undefined" &&
                    window.location.host.startsWith("admin.")
                      ? "/login"
                      : "/admin/login"
                  }
                >
                  Sign in
                </LinkButton>
              )}
            </Row>
          </Stack>
        </Notice>
      ) : loading ? (
        <LoadingState label="Reading Redis entries…" />
      ) : (
        page && (
          <Stack>
            <Row spread>
              <Text small>
                {page.entries.length}{" "}
                {page.entries.length === 1 ? "entry" : "entries"} on this scan
                page
              </Text>
              <Badge tone="warning">Editable</Badge>
            </Row>
            {page.entries.length ? (
              <DataTable
                caption="Redis entries"
                headings={["Key", "Type", "Expiry"]}
              >
                {page.entries.map((entry) => (
                  <tr key={entry.key}>
                    <td>
                      <button
                        className="redis-key-button"
                        type="button"
                        onClick={() => void inspect(entry.key)}
                      >
                        {entry.key}
                      </button>
                    </td>
                    <td>
                      <Badge tone="accent">{entry.type}</Badge>
                    </td>
                    <td>{expiry(entry.ttl)}</td>
                  </tr>
                ))}
              </DataTable>
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
      {detailLoading && <LoadingState label="Reading entry…" />}
      {detailError && (
        <Notice title="Could not read this entry" tone="error">
          {detailError}
        </Notice>
      )}
      {mutationStatus && (
        <Notice title="Redis operation complete" tone="success">
          {mutationStatus}
        </Notice>
      )}
      {detail && (
        <div className="redis-panel">
          <Card>
            <Stack>
              <div className="redis-detail-heading">
                <h2 ref={detailHeading} tabIndex={-1}>
                  {detail.key}
                </h2>
                <Button
                  variant="ghost"
                  aria-label="Close entry preview"
                  onClick={() => setDetail(null)}
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
                  <dl className="redis-details">
                    <div>
                      <dt>Type</dt>
                      <dd>
                        <Badge tone="accent">{detail.type}</Badge>
                      </dd>
                    </div>
                    <div>
                      <dt>Expiry at read time</dt>
                      <dd>{expiry(detail.ttl)}</dd>
                    </div>
                    <div>
                      <dt>Size</dt>
                      <dd>
                        {detail.size.toLocaleString()}{" "}
                        {detail.type === "string" ? "bytes" : "items"}
                      </dd>
                    </div>
                  </dl>
                  {detail.truncated && (
                    <Notice title="Showing a bounded preview">
                      This entry exceeds the preview limit. The value below is
                      incomplete.
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
                        onChange={(event) => setEditor(event.target.value)}
                      />
                      <Row>
                        <Button disabled={mutating} onClick={() => void save()}>
                          <Save size={15} aria-hidden="true" />
                          {mutating ? "Saving…" : "Save changes"}
                        </Button>
                        <Button
                          variant="secondary"
                          disabled={mutating}
                          onClick={() => {
                            setEditor(formatValue(detail.value));
                            setEditing(false);
                            setMutationError("");
                          }}
                        >
                          Cancel
                        </Button>
                      </Row>
                    </Stack>
                  ) : (
                    <CodeBlock>{formatValue(detail.value)}</CodeBlock>
                  )}
                  {mutationError && (
                    <Notice title="Could not update this entry" tone="error">
                      {mutationError}
                    </Notice>
                  )}
                  {!editing && (
                    <Row>
                      {editableRedisType(detail.type) && !detail.truncated && (
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setMutationError("");
                            setMutationStatus("");
                            setEditing(true);
                          }}
                        >
                          <Pencil size={15} aria-hidden="true" />
                          Edit value
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        onClick={() => setConfirmDelete(true)}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        Delete entry
                      </Button>
                    </Row>
                  )}
                  {confirmDelete && (
                    <Notice title="Delete this Redis entry?" tone="error">
                      <Stack gap="small">
                        <Text>
                          This permanently removes {detail.key}. This action
                          cannot be undone.
                        </Text>
                        <Row>
                          <Button
                            variant="danger"
                            disabled={mutating}
                            onClick={() => void remove()}
                          >
                            {mutating ? "Deleting…" : "Confirm delete"}
                          </Button>
                          <Button
                            variant="secondary"
                            disabled={mutating}
                            onClick={() => setConfirmDelete(false)}
                          >
                            Keep entry
                          </Button>
                        </Row>
                      </Stack>
                    </Notice>
                  )}
                  <Text muted small>
                    Strings: up to 64 KiB. Collections: a sample, with long
                    values shortened. Hashes and sorted sets show alternating
                    field/value or member/score pairs. Non-UTF-8 value bytes
                    display as replacement characters.
                  </Text>
                </>
              )}
            </Stack>
          </Card>
        </div>
      )}
    </Stack>
  );
}
