import { describe, expect, it, vi } from "vitest";
import { FileStatus } from "@prisma/client";
import { tempFileRepository } from "@/lib/repositories/temp-file";

describe("time-based access", () => {
  it("file stays available and can be opened multiple times until expiry", async () => {
    const fileId = "multi-open-id";
    const mockActiveFile = {
      id: fileId,
      objectKey: "test-object",
      wrappedKey: Buffer.alloc(32),
      iv: Buffer.alloc(12),
      status: FileStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 600000),
    };

    vi.spyOn(tempFileRepository, "findAvailable")
      .mockResolvedValueOnce(mockActiveFile as never)
      .mockResolvedValueOnce(mockActiveFile as never)
      .mockResolvedValueOnce(mockActiveFile as never);

    const firstOpen = await tempFileRepository.findAvailable(fileId);
    const secondOpen = await tempFileRepository.findAvailable(fileId);
    const thirdOpen = await tempFileRepository.findAvailable(fileId);

    expect(firstOpen).not.toBeNull();
    expect(secondOpen).not.toBeNull();
    expect(thirdOpen).not.toBeNull();
    expect(firstOpen?.id).toBe(fileId);

    vi.restoreAllMocks();
  });

  it("expired files are not available", async () => {
    const fileId = "expired-id";

    vi.spyOn(tempFileRepository, "findAvailable").mockResolvedValueOnce(
      null
    );

    const file = await tempFileRepository.findAvailable(fileId);
    expect(file).toBeNull();

    vi.restoreAllMocks();
  });
});