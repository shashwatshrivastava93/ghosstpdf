import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import * as crypto from "crypto";
import { cleanupService } from "@/lib/services/cleanup";
import { tempFileRepository } from "@/lib/repositories/temp-file";
import { fileLogRepository } from "@/lib/repositories/file-log";
import { storageService } from "@/lib/services/storage";

beforeEach(() => {
  vi.spyOn(fileLogRepository, "create").mockResolvedValue({} as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("cleanupService", () => {
  it("processes expired files", async () => {
    const mockData = [
      { id: crypto.randomUUID(), objectKey: "test-expired-1" },
      { id: crypto.randomUUID(), objectKey: "test-expired-2" },
    ];

    vi.spyOn(tempFileRepository, "findExpiredFiles").mockResolvedValueOnce(
      mockData as never
    );
    const deleteSpy = vi
      .spyOn(tempFileRepository, "delete")
      .mockResolvedValue({} as never);
    vi.spyOn(storageService, "delete").mockResolvedValue(undefined);

    const count = await cleanupService.processExpiredFiles();

    expect(count).toBe(2);
    expect(deleteSpy).toHaveBeenCalledTimes(2);

    vi.restoreAllMocks();
  });

  it("cleans up a single file", async () => {
    const fileId = crypto.randomUUID();
    const mockFile = { id: fileId, objectKey: "test-single-cleanup" };

    vi.spyOn(tempFileRepository, "findById").mockResolvedValueOnce(
      mockFile as never
    );
    const deleteSpy = vi
      .spyOn(tempFileRepository, "delete")
      .mockResolvedValue({} as never);
    vi.spyOn(storageService, "delete").mockResolvedValue(undefined);

    await cleanupService.cleanupFile(fileId);

    expect(deleteSpy).toHaveBeenCalledWith(fileId);

    vi.restoreAllMocks();
  });

  it("handles non-existent files gracefully", async () => {
    vi.spyOn(tempFileRepository, "findById").mockResolvedValueOnce(null);

    await expect(
      cleanupService.cleanupFile("non-existent-id")
    ).resolves.not.toThrow();

    vi.restoreAllMocks();
  });

  it("runs full cleanup and returns count", async () => {
    vi.spyOn(cleanupService, "processExpiredFiles").mockResolvedValueOnce(3);

    const result = await cleanupService.runFullCleanup();

    expect(result).toEqual({ deleted: 3 });

    vi.restoreAllMocks();
  });
});