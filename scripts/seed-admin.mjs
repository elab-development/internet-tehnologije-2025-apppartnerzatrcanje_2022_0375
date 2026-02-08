import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { Client } from "pg";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function buildPasswordHash(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  loadEnvFile(resolve(process.cwd(), ".env.local"));
  loadEnvFile(resolve(process.cwd(), ".env"));

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@runly.local";
  const username = process.env.SEED_ADMIN_USERNAME ?? "runly_admin";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const passwordHash = buildPasswordHash(password);

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  await client.query(
    `
      INSERT INTO users (
        email, lozinka_hash, korisnicko_ime, slika_korisnika, starost, pol,
        nivo_kondicije, tempo_trcanja, role, created_at, updated_at
      )
      VALUES (
        $1, $2, $3, NULL, 30, 'drugo', 'srednji', 6.0, 'admin', NOW(), NOW()
      )
      ON CONFLICT (email)
      DO UPDATE SET
        role = 'admin',
        lozinka_hash = EXCLUDED.lozinka_hash,
        korisnicko_ime = EXCLUDED.korisnicko_ime,
        updated_at = NOW();
    `,
    [email, passwordHash, username]
  );

  await client.end();
  console.log(`Admin user ready: ${email} / ${password}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
