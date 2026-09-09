#!/usr/bin/env node
import { cpSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const source = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "municipality-maps",
);
const destination = resolve(
  process.argv[2] ?? "public/municipality-maps",
);

mkdirSync(destination, { recursive: true });
cpSync(source, destination, { recursive: true });
console.log(`Copied municipality maps to ${destination}`);
