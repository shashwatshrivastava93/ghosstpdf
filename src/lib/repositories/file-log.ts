import { prisma } from "@/lib/prisma";

export type FileLogEvent =
  | "UPLOADED"
  | "OPENED"
  | "DOWNLOADED"
  | "EXPIRED";

export const fileLogRepository = {
  async create(fileId: string, event: FileLogEvent, detail?: string) {
    return prisma.fileLog.create({
      data: { fileId, event, detail },
    });
  },

  async list(fileId?: string, limit = 200) {
    return prisma.fileLog.findMany({
      where: fileId ? { fileId } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
};