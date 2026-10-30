// Applies db/schema.sql then db/seed.sql to the Neon database, then prints
// the rows that now exist, so we can see our facts with our own eyes.
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

// Reads a key like DATABASE_URL out of a .env-style file.
function readEnvValue(file, key) {
  const text = readFileSync(file, "utf8");
  const match = text.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match) {
    console.error(`Missing ${key} in ${file}. Paste your connection string first.`);
    process.exit(1);
  }
  return match[1].trim();
}

// SQL files contain several statements separated by semicolons, so split them
// apart — while ignoring semicolons that live inside 'quoted strings'.
function splitStatements(source) {
  const withoutComments = source.replace(/--[^\n]*/g, "");
  const statements = [];
  let current = "";
  let insideQuote = false;
  for (const ch of withoutComments) {
    if (ch === "'") insideQuote = !insideQuote;
    if (ch === ";" && !insideQuote) {
      statements.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) statements.push(current.trim());
  return statements.filter(Boolean);
}

const url = readEnvValue(".env.local", "DATABASE_URL");
const sql = neon(url);

console.log("Applying db/schema.sql …");
for (const statement of splitStatements(readFileSync("db/schema.sql", "utf8"))) {
  await sql.query(statement);
}

console.log("Applying db/seed.sql …");
for (const statement of splitStatements(readFileSync("db/seed.sql", "utf8"))) {
  await sql.query(statement);
}

console.log("\nrestaurants table:");
console.table(await sql.query(`SELECT * FROM restaurants ORDER BY id`));

console.log("reviews table:");
console.table(
  await sql.query(
    `SELECT id, restaurant_id, rating, comment, created_at FROM reviews ORDER BY id`
  )
);
