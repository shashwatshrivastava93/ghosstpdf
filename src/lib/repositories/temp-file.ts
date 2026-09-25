import { prisma } from "@/lib/prisma";
import { FileStatus } from "@prisma/client";

export interface CreateTempFileInput {
  id: string;
  objectKey: string;
  wrappedKey: Buffer;
  iv: Buffer;
  expiresAt: Date;
}

export const tempFileRepository = {
  async create(data: CreateTempFileInput) {
    return prisma.tempFile.create({
      data: {
        id: data.id,
        objectKey: data.objectKey,
        wrappedKey: data.wrappedKey,
        iv: data.iv,
        expiresAt: data.expiresAt,
      },
    });
  },

  async findById(id: string) {
    return prisma.tempFile.findUnique({
      where: { id },
    });
  },

  async findAvailable(id: string) {
    return prisma.tempFile.findFirst({
      where: {
        id,
        status: FileStatus.ACTIVE,
        expiresAt: { gt: new Date() },
      },
    });
  },

  async delete(id: string) {
    return prisma.tempFile.delete({
      where: { id },
    });
  },

  async findExpiredFiles() {
    return prisma.tempFile.findMany({
      where: {
        status: FileStatus.ACTIVE,
        expiresAt: { lt: new Date() },
      },
    });
  },
};
