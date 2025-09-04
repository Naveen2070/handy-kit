import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "path";
import * as fs from "fs/promises";

// Mock system-level modules
vi.mock("fs/promises");
vi.mock("os", () => ({ homedir: () => "/home/test" }));

// Mock internal utilities before import
vi.mock("../../src/lib/utils/common/index.js", async () => {
  return {
    ...(await vi.importActual("../../src/lib/utils/common/index.js")),
    askUser: vi.fn(),
    printTemplate: vi.fn(),
  };
});

vi.mock("../../src/lib/utils/scaffold/index.js", async () => {
  return {
    ...(await vi.importActual("../../src/lib/utils/scaffold/index.js")),
    runInteractiveWizard: vi.fn(),
    createFoldersFromTemplate: vi.fn(),
  };
});

// Import AFTER mocks
import { scaffoldDir } from "../../src/lib/scaffold/scaffold-dir.js";
import { askUser } from "../../src/lib/utils/common/index.js";
import {
  runInteractiveWizard,
  createFoldersFromTemplate,
} from "../../src/lib/utils/scaffold/index.js";

describe("scaffoldDir (unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should reject both interactive and non-interactive modes", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await scaffoldDir({ interactive: true, non_interactive: true });
    expect(errorSpy).toHaveBeenCalledWith(
      "❌ Cannot use interactive mode in non-interactive mode."
    );
  });

  it("should error if entry is missing in non-interactive mode", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await scaffoldDir({ non_interactive: true });
    expect(errorSpy).toHaveBeenCalledWith(
      "❌ Entry folder is required in non-interactive mode."
    );
  });

  it("should handle error when reading invalid custom template file", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fs.readFile).mockRejectedValue(new Error("Invalid JSON"));

    await scaffoldDir({
      entry: "test-entry",
      customFile: "invalid.json",
      non_interactive: true,
    });

    expect(errorSpy).toHaveBeenCalledWith(
      "❌ Error reading custom template:",
      expect.any(Error)
    );
  });

  it("should create structure from valid custom schema file", async () => {
    const fakeTemplate = { files: { hello: { type: "txt", content: "hi" } } };
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(fakeTemplate));

    await scaffoldDir({
      entry: "test-entry",
      customFile: "valid.json",
      non_interactive: true,
      force: true,
    });

    expect(createFoldersFromTemplate).toHaveBeenCalledWith(
      fakeTemplate,
      path.resolve(process.cwd(), "test-entry"),
      { force: true }
    );
  });

  it("should show error for unknown template name", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fs.readdir).mockResolvedValue([]); // no templates

    await scaffoldDir({
      entry: "test-entry",
      templateName: "unknown-template",
      non_interactive: true,
    });

    expect(errorSpy).toHaveBeenCalledWith(
      "❌ Template not found:",
      "unknown-template"
    );
  });

  it("should run interactive wizard and save if user agrees", async () => {
    const fakeTemplate = { files: { test: { type: "txt", content: "hello" } } };

    vi.mocked(runInteractiveWizard).mockResolvedValue(fakeTemplate);
    vi.mocked(askUser)
      .mockResolvedValueOnce("y") // Save?
      .mockResolvedValueOnce("my-template") // Name
      .mockResolvedValueOnce("y");

    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    await scaffoldDir({
      interactive: true,
      entry: "test-entry",
    });

    expect(fs.writeFile).toHaveBeenCalledWith(
      path.resolve(
        "/home/test/.scaffold-cli/templates/dir",
        "my-template.json"
      ),
      JSON.stringify(fakeTemplate, null, 2),
      "utf8"
    );
  });

  it("should skip save if user says no in interactive wizard", async () => {
    const fakeTemplate = { files: { test: { type: "txt", content: "hello" } } };

    vi.mocked(runInteractiveWizard).mockResolvedValue(fakeTemplate);
    vi.mocked(askUser).mockResolvedValueOnce("n").mockResolvedValueOnce("y");

    await scaffoldDir({
      interactive: true,
      entry: "test-entry",
    });

    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it("should abort if user declines confirmation in non-force mode", async () => {
    const fakeTemplate = { files: { test: { type: "txt", content: "hello" } } };
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(fakeTemplate));
    vi.mocked(askUser).mockResolvedValueOnce("n");

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await scaffoldDir({
      entry: "test-entry",
      customFile: "valid.json",
      non_interactive: false,
    });

    expect(logSpy).toHaveBeenCalledWith("❌ Aborted by user.");
    expect(createFoldersFromTemplate).not.toHaveBeenCalled();
  });

  it("should proceed with confirmation in non-force mode", async () => {
    const fakeTemplate = { files: { test: { type: "txt", content: "hello" } } };
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(fakeTemplate));
    vi.mocked(askUser).mockResolvedValueOnce("y");

    await scaffoldDir({
      entry: "test-entry",
      customFile: "valid.json",
      non_interactive: false,
    });

    expect(createFoldersFromTemplate).toHaveBeenCalled();
  });
});
