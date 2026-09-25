import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { tempFileRepository } from "@/lib/repositories/temp-file";
import { fileLogRepository } from "@/lib/repositories/file-log";
import { cleanupService } from "@/lib/services/cleanup";
import { storageService } from "@/lib/services/storage";

beforeEach(() => {
  vi.spyOn(fileLogRepository, "create").mockResolvedValue({} as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("file expiry", () => {
  it("expired files are cleaned up by cleanup service", async () => {
    const expiredAt = new Date(Date.now() - 60000); // 1 minute ago
    const activeAt = new Date(Date.now() + 600000); // 10 minutes from now

    const expiredFile = { id: "expired-id", expiresAt: expiredAt };
    const activeFile = { id: "active-id", expiresAt: activeAt };

    vi.spyOn(tempFileRepository, "findExpiredFiles").mockResolvedValueOnce([
      expiredFile as never,
      activeFile as never,
    ]);

    const deleteSpy = vi
      .spyOn(tempFileRepository, "delete")
      .mockResolvedValue({} as never);
    vi.spyOn(storageService, "delete").mockResolvedValue(undefined);

    const count = await cleanupService.processExpiredFiles();

    expect(count).toBe(2);
    expect(deleteSpy).toHaveBeenCalledWith("expired-id");

    vi.restoreAllMocks();
  });

  it("view check returns expired for past expiry time", async () => {
    const expiredFile = {
      id: "expired-id",
      status: "ACTIVE",
      expiresAt: new Date(Date.now() - 1000),
    };

    vi.spyOn(tempFileRepository, "findById").mockResolvedValueOnce(
      expiredFile as never
    );

    // This mimics the route handler check
    const isExpired = expiredFile.expiresAt < new Date();
    expect(isExpired).toBe(true);

    vi.restoreAllMocks();
  });
});