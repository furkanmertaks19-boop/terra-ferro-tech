import { spawnSync } from "node:child_process";
import { encodedSupabaseDirectUrl } from "./supabase-migrate-utils";

const url = encodedSupabaseDirectUrl();
const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: url,
    DIRECT_URL: url,
  },
  shell: true,
});
process.exit(result.status ?? 1);
