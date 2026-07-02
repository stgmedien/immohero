# Regulatorik-Korpus — Pipeline

Datengrundlage für den Rechts-Layer der Pilot Journey Engine
(siehe [docs/pilot-journey-engine-plan.md](../../docs/pilot-journey-engine-plan.md), §4).

## Pipeline

```
1. Crawl     node scripts/regulations/crawl.mjs        → data/regulations/raw/ + text/ + manifest.json
2. Chunk     node scripts/regulations/chunk.mjs        → data/regulations/chunks/*.jsonl (+ all.jsonl)
3. Embed     node --env-file=.env.local scripts/regulations/embed.mjs   (braucht VOYAGE_API_KEY)
                                                       → data/regulations/embeddings/all.jsonl
4. Import    (Phase 0) Insert in Neon regulation_chunks (pgvector) — Migration 0007
```

- Quellen definiert in `sources.json` (nur amtliche Quellen: EUR-Lex, EASA, LBA,
  gesetze-im-internet, dipul). Neues Land = neue Einträge dort.
- `crawl.mjs <id>` crawlt nur eine Quelle neu (Manifest wird gemerged).
- `manifest.json` enthält pro Dokument `sha256` — Basis der späteren
  Diff-Erkennung im monatlichen Update-Cron.
- `data/regulations/raw/` ist gitignored (große PDFs/HTML-Rohdaten);
  `text/` und `chunks/` sind committet und diffbar.
