#!/usr/bin/env node

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  assessStopRequirements,
  collectFilePaths,
  commandFailed,
  createEmptyState,
  handleHookInput,
  isCodeLikeFile,
  isTestFile,
  matchesAny,
  updateStateForBash,
  updateStateForEdit,
} from "./task-quality-gate.mjs";

test("createEmptyState returns baseline structure", () => {
  const state = createEmptyState("abc");
  assert.equal(state.sessionId, "abc");
  assert.equal(state.edited, false);
  assert.equal(state.codeEdited, false);
  assert.deepEqual(state.editedFiles, []);
});

test("isTestFile detects common test patterns", () => {
  assert.equal(isTestFile("src/foo.test.ts"), true);
  assert.equal(isTestFile("packages/__tests__/bar.js"), true);
  assert.equal(isTestFile("src/foo.ts"), false);
});

test("isCodeLikeFile recognizes known extensions", () => {
  assert.equal(isCodeLikeFile("src/foo.ts"), true);
  assert.equal(isCodeLikeFile("src/foo.txt"), false);
  assert.equal(isCodeLikeFile("src/foo.test.ts"), true);
});

test("collectFilePaths normalizes nested file_path keys", () => {
  const paths = collectFilePaths(
    { tool_input: { file_path: "src/foo.ts" } },
    "/tmp/repo",
  );
  assert.deepEqual(paths, ["/tmp/repo/src/foo.ts"]);
});

test("updateStateForEdit marks code/test flags", () => {
  const state = createEmptyState("x");
  const next = updateStateForEdit(state, ["/tmp/repo/src/foo.test.ts"]);
  assert.equal(next.edited, true);
  assert.equal(next.codeEdited, true);
  assert.equal(next.testTouched, true);
});

test("updateStateForBash flags lint/test/commit commands", () => {
  const base = createEmptyState("x");
  const lint = updateStateForBash(base, "pnpm run lint", "");
  const tests = updateStateForBash(base, "pnpm vitest", "");
  const commit = updateStateForBash(base, "git commit -m wip", "");
  assert.equal(lint.lintRan, true);
  assert.equal(tests.testRan, true);
  assert.equal(commit.commitRan, true);
});

test("updateStateForBash ignores failed commands", () => {
  const base = createEmptyState("x");
  const result = updateStateForBash(base, "pnpm vitest", "Error: command failed");
  assert.equal(result.testRan, false);
});

test("matchesAny and commandFailed work as expected", () => {
  assert.equal(matchesAny("pnpm run lint", [/\blint\b/]), true);
  assert.equal(commandFailed("error: nope"), true);
  assert.equal(commandFailed("all good"), false);
});

test("assessStopRequirements blocks when tests untouched after code edits", () => {
  const decision = assessStopRequirements({
    cwd: "/tmp",
    state: { ...createEmptyState("x"), codeEdited: true },
    gitFacts: { isGitRepo: false, changedFiles: [] },
  });
  assert.equal(decision?.decision, "block");
});

test("assessStopRequirements returns null on clean state", () => {
  const decision = assessStopRequirements({
    cwd: "/tmp",
    state: createEmptyState("x"),
    gitFacts: { isGitRepo: false, changedFiles: [] },
  });
  assert.equal(decision, null);
});

test("handleHookInput on Stop returns continue:true when clean", async () => {
  const result = await handleHookInput({
    hook_event_name: "Stop",
    session_id: "test-clean-session",
    cwd: "/tmp",
  });
  assert.equal(result.continue, true);
  assert.equal(result.decision, undefined);
});
