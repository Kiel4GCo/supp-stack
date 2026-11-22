/// <reference types="node" />
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const WORKFLOWS = ["admin-access-tests.yml", "security-scan.yml"];

function concurrency(file: string) {
  const text = readFileSync(resolve(process.cwd(), ".github/workflows", file), "utf8");
  const block = text.match(/^concurrency:\n((?:[ \t]+.*\n)+)/m);
  if (!block) throw new Error(`${file}: missing top-level concurrency block`);
  const group = block[1].match(/group:\s*(.+)/)?.[1].trim() ?? "";
  const cancel = block[1].match(/cancel-in-progress:\s*(.+)/)?.[1].trim() ?? "";
  return { group, cancel };
}

// Evaluates the cancel-in-progress expression for a given event, supporting
// literal booleans and `github.event_name == '<x>'` clauses joined by `||`.
function cancels(expr: string, event: string): boolean {
  if (expr === "true") return true;
  if (expr === "false") return false;
  const inner = expr.match(/^\$\{\{\s*(.+?)\s*\}\}$/)?.[1];
  if (!inner) throw new Error(`Unsupported expression: ${expr}`);
  return inner.split("||").some((clause) => {
    const m = clause.trim().match(/^github\.event_name\s*==\s*'([^']+)'$/);
    if (!m) throw new Error(`Unsupported clause: ${clause}`);
    return m[1] === event;
  });
}

describe.each(WORKFLOWS)("%s concurrency", (file) => {
  const { group, cancel } = concurrency(file);

  it("groups runs per workflow and per branch or pull request", () => {
    expect(group).toContain("github.workflow");
    expect(group).toContain("github.event.pull_request.number");
    expect(group).toContain("github.ref");
  });

  it("cancels superseded push runs", () => expect(cancels(cancel, "push")).toBe(true));
  it("cancels superseded pull request runs", () =>
    expect(cancels(cancel, "pull_request")).toBe(true));
  it("never cancels scheduled scans", () => expect(cancels(cancel, "schedule")).toBe(false));
  it("never cancels manually triggered scans", () =>
    expect(cancels(cancel, "workflow_dispatch")).toBe(false));
});
