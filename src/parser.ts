function isQuoted(v: string) {
  return (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  );
}

function unquote(v: string) {
  const q = v[0];
  const inner = v.slice(1, -1);

  if (q === "'") {
    return inner; // literal
  }

  // double-quote: handle basic escapes
  let out = "";
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === "\\" && i + 1 < inner.length) {
      const n = inner[i + 1];
      if (n === "n") {
        out += "\n";
        i++;
        continue;
      }
      if (n === "r") {
        out += "\r";
        i++;
        continue;
      }
      if (n === "t") {
        out += "\t";
        i++;
        continue;
      }
      if (n === "\\") {
        out += "\\";
        i++;
        continue;
      }
      if (n === '"') {
        out += '"';
        i++;
        continue;
      }
      // unknown escape -> keep as-is (backslash removed)
      out += n;
      i++;
      continue;
    }
    out += ch;
  }
  return out;
}

export function parseEnv(
  text: string,
  opts: { strict: boolean; filePath: string },
): Record<string, string> {
  const out: Record<string, string> = {};
  const lines = text.split(/\r?\n/);

  for (let idx = 0; idx < lines.length; idx++) {
    const raw = lines[idx];
    const lineNo = idx + 1;

    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    let line = trimmed;
    if (line.startsWith("export ")) line = line.slice("export ".length).trim();

    const eq = line.indexOf("=");
    if (eq <= 0) {
      if (opts.strict) {
        throw new Error(
          `Invalid line ${opts.filePath}:${lineNo} (expected KEY=value)`,
        );
      }
      continue;
    }

    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();

    if (!key) {
      if (opts.strict)
        throw new Error(`Invalid key at ${opts.filePath}:${lineNo}`);
      continue;
    }

    // Inline comment stripping (only if not quoted)
    if (!isQuoted(val)) {
      const hashIndex = val.indexOf("#");
      if (hashIndex !== -1) {
        val = val.slice(0, hashIndex).trim();
      }
    }

    if (isQuoted(val)) {
      val = unquote(val);
    }

    out[key] = val;
  }

  return out;
}
