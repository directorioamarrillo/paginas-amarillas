import { http } from "../lib/http";

export const backupApi = {
  getSummary: () => http.get("/backups"),
  getStatus: () => http.get("/backups/status"),
  generate: () => http.post("/backups/generate"),
  download: (path) => http.get("/backups/download", {
    params: { path },
    responseType: "blob"
  }),
  remove: (path) => http.delete("/backups", { params: { path } }),
  updateSchedule: (frequency) => http.put("/backups/schedule", { frequency }),
  restore: (path) => http.post("/backups/restore", { path }),
  resetStatus: () => http.post("/backups/reset-status")
};
