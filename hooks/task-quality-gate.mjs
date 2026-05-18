#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const STATE_ROOT = path.join(
  os.homedir(),
  ".claude",
  "hooks",
  "task-quality-state",
);

const CODE_EXTENSIONS = new Set([
  ".c",
  ".cc",
  ".cpp",
  ".cs",
  ".cts",
  ".cjs",
  ".go",
  ".java",
  ".js",
  ".jsx",
  ".kt",
  ".mjs",
  ".mts",
  ".php",
  ".py",
  ".rb",
  ".rs",
  ".sh",
  ".sql",
  ".swift",
  ".toml",
  ".ts",
  ".tsx",
  ".vue",
  ".yaml",
  ".yml",
  ".json",
  ".jsonc",
  ".svelte",
]);

const TEST_FILE_PATTERNS = [
  /(^|\/)tests?\//i,
  /(^|\/)__tests__\//i,
  /(^|\/)__test__\//i,
  /\.test\./i,
  /\.spec\./i,
];

const LINT_COMMAND_PATTERNS = [
  /\beslint\b/,
  /\bstylelint\b/,
  /\bbiome\b/,
  /\bruff\b/,
  /\bswiftlint\b/,
  /\brubocop\b/,
  /\bphpstan\b/,
  /\bgo\s+vet\b/,
  /\bcargo\s+clippy\b/,
  /^\s*(npm|pnpm|yarn|bun)\s+(run\s+)?lint\b/,
];

const TEST_COMMAND_PATTERNS = [
  /\bvitest\b/,
  /\bjest\b/,
  /\bpytest\b/,
  /\bphpunit\b/,
  /\bplaywright\s+test\b/,
  /\bgo\s+test\b/,
  /\bcargo\s+test\b/,
  /\bdeno\s+test\b/,
  /^\s*(npm|pnpm|yarn|bun)\s+(run\s+)?test\b/,
];

const COMMIT_COMMAND_PATTERNS = [
  /^\s*git\s+commit\b/,
  /^\s*jj\s+commit\b/,
  /^\s*jj\s+describe\b/,
];

const FAILURE_PATTERNS = [
  /command failed/i,
  /failed with exit code/i,
  /\beli?fecycle\b/i,
  /^error:/im,
  /\btraceback\b/i,
];

const DIRECT_PATH_KEYS = new Set([
  "file_path",
  "path",
  "new_path",
  "old_path",
]);

export const createEmptyState = (sessionId = "") => ({
  sessionId,
  edited: false,
  codeEdited: false,
  testTouched: false,
  lintRan: false,
  testRan: false,
  commitRan: false,
  editedFiles: [],
  updatedAt: "",
  lastEditAt: "",
});

export const isTestFile = (filePath) => {
  const normalized = filePath.replace(/\\/g, "/");
  return TEST_FILE_PATTERNS.some((pattern) => pattern.test(normalized));
};

export const isCodeLikeFile = (filePath) => {
  const normalized = filePath.replace(/\\/g, "/");
  if (isTestFile(normalized)) return true;
  return CODE_EXTENSIONS.has(path.extname(normalized).toLowerCase());
};

export const matchesAny = (text, patterns) =>
  patterns.some((pattern) => pattern.test(text));

export const commandFailed = (text) => matchesAny(text, FAILURE_PATTERNS);

const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
};

export const collectFilePaths = (value, cwd, found = new Set()) => {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectFilePaths(item, cwd, found);
    }
    return [...found];
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (DIRECT_PATH_KEYS.has(key) && typeof child === "string" && child.trim()) {
        const absolute = path.isAbsolute(child)
          ? path.normalize(child)
          : path.normalize(path.join(cwd, child));
        found.add(absolute);
        continue;
      }

      if ((key === "file_paths" || key === "paths") && Array.isArray(child)) {
        for (const candidate of child) {
          if (typeof candidate !== "string" || !candidate.trim()) continue;
          const absolute = path.isAbsolute(candidate)
            ? path.normalize(candidate)
            : path.normalize(path.join(cwd, candidate));
          found.add(absolute);
        }
        continue;
      }

      collectFilePaths(child, cwd, found);
    }
  }

  return [...found];
};

export const updateStateForEdit = (state, files, now = new Date().toISOString()) => {
  if (files.length === 0) return state;

  const uniqueFiles = [...new Set([...state.editedFiles, ...files])].sort();

  return {
    ...state,
    edited: true,
    codeEdited: state.codeEdited || files.some(isCodeLikeFile),
    testTouched: state.testTouched || files.some(isTestFile),
    lintRan: false,
    testRan: false,
    commitRan: false,
    editedFiles: uniqueFiles,
    updatedAt: now,
    lastEditAt: now,
  };
};

export const updateStateForBash = (
  state,
  command,
  responseText = "",
  now = new Date().toISOString(),
) => {
  if (!command || commandFailed(responseText)) {
    return {
      ...state,
      updatedAt: now,
    };
  }

  return {
    ...state,
    lintRan: state.lintRan || matchesAny(command, LINT_COMMAND_PATTERNS),
    testRan: state.testRan || matchesAny(command, TEST_COMMAND_PATTERNS),
    commitRan: state.commitRan || matchesAny(command, COMMIT_COMMAND_PATTERNS),
    updatedAt: now,
  };
};

const readJsonIfExists = async (filePath) => {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const loadState = async (sessionId) => {
  const filePath = path.join(STATE_ROOT, `${sessionId}.json`);
  const state = await readJsonIfExists(filePath);
  return state ? { ...createEmptyState(sessionId), ...state } : createEmptyState(sessionId);
};

const saveState = async (state) => {
  await fs.mkdir(STATE_ROOT, { recursive: true });
  const filePath = path.join(STATE_ROOT, `${state.sessionId}.json`);
  await fs.writeFile(filePath, JSON.stringify(state, null, 2), "utf-8");
};

const removeState = async (sessionId) => {
  const filePath = path.join(STATE_ROOT, `${sessionId}.json`);
  await fs.rm(filePath, { force: true });
};

const runGit = (cwd, args) =>
  spawnSync("git", args, {
    cwd,
    encoding: "utf-8",
  });

export const getGitFacts = (cwd) => {
  const topLevelResult = runGit(cwd, ["rev-parse", "--show-toplevel"]);
  if (topLevelResult.status !== 0) {
    return {
      isGitRepo: false,
      changedFiles: [],
    };
  }

  const trackedResult = runGit(cwd, ["diff", "--name-only"]);
  const stagedResult = runGit(cwd, ["diff", "--name-only", "--cached"]);
  const untrackedResult = runGit(cwd, ["ls-files", "--others", "--exclude-standard"]);

  const changedFiles = [
    ...ensureArray(trackedResult.stdout?.split("\n").filter(Boolean)),
    ...ensureArray(stagedResult.stdout?.split("\n").filter(Boolean)),
    ...ensureArray(untrackedResult.stdout?.split("\n").filter(Boolean)),
  ].map((filePath) => path.normalize(filePath));

  return {
    isGitRepo: true,
    changedFiles: [...new Set(changedFiles)].sort(),
  };
};

export const assessStopRequirements = ({
  cwd,
  state,
  gitFacts,
}) => {
  const changedFiles = gitFacts.changedFiles;
  const codeChanged =
    state.codeEdited || changedFiles.some((filePath) => isCodeLikeFile(filePath));

  if (codeChanged && !state.testTouched) {
    return {
      decision: "block",
      reason:
        "코드 변경이 감지됐는데 테스트 파일 추가/수정이 없었음. 관련 테스트코드를 먼저 작성하거나 갱신하셈.",
      inject_prompt:
        "코드 변경이 감지됐는데 테스트 파일 추가/수정이 없었음. 관련 테스트코드를 먼저 작성하거나 갱신하고, 그 다음 lint와 테스트를 실행해서 원하는 결과가 나오는지 확인하셈.",
    };
  }

  if (codeChanged && !state.lintRan) {
    return {
      decision: "block",
      reason: "코드 변경 후 lint 검증이 아직 실행되지 않았음.",
      inject_prompt:
        "코드 변경 후 lint 검증이 아직 실행되지 않았음. 실제 lint 명령을 실행해서 경고/에러 없는지 확인하셈.",
    };
  }

  if (codeChanged && !state.testRan) {
    return {
      decision: "block",
      reason: "코드 변경 후 테스트 실행이 아직 확인되지 않았음.",
      inject_prompt:
        "코드 변경 후 테스트 실행이 아직 확인되지 않았음. 테스트를 실행하고 원하는 결과가 나오는지 확인한 뒤에만 종료하셈.",
    };
  }

  if (gitFacts.isGitRepo && changedFiles.length > 0 && !state.commitRan) {
    return {
      decision: "block",
      reason: "변경사항이 아직 커밋되지 않았음.",
      inject_prompt:
        "현재 git 변경사항이 남아 있음. 검증이 끝났다면 저장소 컨벤션에 맞게 커밋까지 완료하셈.",
    };
  }

  return null;
};

const handlePostToolUse = async (input) => {
  const state = await loadState(input.session_id);
  const now = new Date().toISOString();
  const toolName = String(input.tool_name || "");

  let nextState = state;
  if (toolName === "Write" || toolName === "Edit" || toolName === "MultiEdit") {
    const files = collectFilePaths(
      {
        tool_input: input.tool_input,
        tool_response: input.tool_response,
      },
      input.cwd,
    );
    nextState = updateStateForEdit(state, files, now);
  } else if (toolName === "Bash") {
    const command =
      String(input.tool_input?.command || input.tool_input?.cmd || "").trim();
    const responseText = [
      String(input.tool_response?.title || ""),
      String(input.tool_response?.output || ""),
    ]
      .filter(Boolean)
      .join("\n");
    nextState = updateStateForBash(state, command, responseText, now);
  } else {
    nextState = {
      ...state,
      updatedAt: now,
    };
  }

  if (nextState.edited || nextState.updatedAt) {
    await saveState(nextState);
  }

  const message = nextState.edited
    ? "코드나 파일을 수정했으면 테스트 작성, lint, 테스트 실행, 커밋까지 끝냈는지 확인하셈."
    : "";

  return message
    ? {
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: message,
        },
      }
    : {};
};

const handleStop = async (input) => {
  const state = await loadState(input.session_id);
  const gitFacts = getGitFacts(input.cwd);
  const decision = assessStopRequirements({
    cwd: input.cwd,
    state,
    gitFacts,
  });

  if (decision) {
    return decision;
  }

  await removeState(input.session_id);
  return {
    continue: true,
  };
};

export const handleHookInput = async (input) => {
  if (!input || typeof input !== "object") {
    return {};
  }

  if (input.hook_event_name === "PostToolUse") {
    return handlePostToolUse(input);
  }

  if (input.hook_event_name === "Stop") {
    return handleStop(input);
  }

  return {};
};

const readStdin = async () => {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
};

const main = async () => {
  const raw = await readStdin();
  const input = raw.trim() ? JSON.parse(raw) : {};
  const result = await handleHookInput(input);
  process.stdout.write(`${JSON.stringify(result)}\n`);
};

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  main().catch((error) => {
    process.stderr.write(`${String(error)}\n`);
    process.exit(1);
  });
}
