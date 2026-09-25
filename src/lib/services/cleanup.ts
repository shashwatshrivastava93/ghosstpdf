import { tempFileRepository } from "@/lib/repositories/temp-file";
import { fileLogRepository } from "@/lib/repositories/file-log";
import { storageService } from "@/lib/services/storage";

export const cleanupService = {
  async processExpiredFiles(): Promise<number> {
    const expiredFiles = await tempFileRepository.findExpiredFiles();

    for (const file of expiredFiles) {
      await storageService.delete(file.objectKey);
      await tempFileRepository.delete(file.id);
      await fileLogRepository.create(file.id, "EXPIRED", "deleted by cleanup job");
    }

    return expiredFiles.length;
  },

  async cleanupFile(id: string): Promise<void> {
    const file = await tempFileRepository.findById(id);
    if (file) {
      await storageService.delete(file.objectKey);
      await tempFileRepository.delete(id);
    }
  },

  async runFullCleanup(): Promise<{
    deleted: number;
  }> {
    const deleted = await this.processExpiredFiles();

    return { deleted };
  },
};