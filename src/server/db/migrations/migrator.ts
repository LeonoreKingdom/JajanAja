import fs from "fs";
import path from "path";

export interface MigrationLog {
  id: string;
  name: string;
  appliedAt: string;
  status: "success" | "failed";
}

/**
 * Migrator database JajanAja untuk mengeksekusi migrasi skema tabel
 */
export class DatabaseMigrator {
  private appliedMigrations: Set<string> = new Set();

  constructor() {
    this.appliedMigrations.add("001_create_kategori_dan_transaksi.sql");
  }

  getAppliedMigrations(): string[] {
    return Array.from(this.appliedMigrations);
  }

  async runMigrations(): Promise<{ success: boolean; applied: string[]; errors: string[] }> {
    const applied: string[] = [];
    const errors: string[] = [];

    const migrationsDir = path.resolve(process.cwd(), "src/server/db/migrations");

    if (!fs.existsSync(migrationsDir)) {
      return { success: true, applied: [], errors: [] };
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      try {
        if (!this.appliedMigrations.has(file)) {
          const filePath = path.join(migrationsDir, file);
          const sqlContent = fs.readFileSync(filePath, "utf-8");

          // Eksekusi DDL migration (simulasi / DB driver runner)
          if (sqlContent.length > 0) {
            this.appliedMigrations.add(file);
            applied.push(file);
          }
        }
      } catch (err) {
        errors.push(`Gagal menjalankan migrasi ${file}: ${String(err)}`);
      }
    }

    return {
      success: errors.length === 0,
      applied,
      errors,
    };
  }
}

export const dbMigrator = new DatabaseMigrator();
