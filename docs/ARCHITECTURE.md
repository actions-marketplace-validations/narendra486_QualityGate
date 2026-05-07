# QualityGate Architecture

QualityGate is a SARIF-only quality gate. It does not call GitHub Advanced Security APIs, Code Scanning APIs, or scanner-specific services. The action reads SARIF 2.1.0 files from the runner filesystem and evaluates findings locally.

## Pipeline

1. `config/inputs.ts` validates and normalizes action inputs.
2. `utils/glob.ts` resolves single files, multiline lists, directories, and globs.
3. `parser/aggregator.ts` reads each SARIF file and continues on malformed files.
4. `parser/sarifParser.ts` supports multiple SARIF runs per file.
5. `parser/normalizer.ts` converts scanner-specific SARIF fields into a common `Finding`.
6. `quality/baseline.ts` suppresses findings already present in a baseline SARIF.
7. `quality/dedupe.ts` removes duplicate findings by fingerprint.
8. `quality/evaluator.ts` applies severity and count thresholds.
9. `formatters/markdown.ts` renders PR comments, step summaries, and JSON reports.
10. `github/*` writes comments, summaries, annotations, and optional check runs.

## Severity Normalization

SARIF levels are mapped as requested:

| SARIF level | QualityGate severity |
| ----------- | -------------------- |
| `error` | `high` |
| `warning` | `medium` |
| `note` / `none` | `low` |

Scanner-provided numeric security severities are also normalized:

| Score range | QualityGate severity |
| ----------- | -------------------- |
| `>= 9.0` | `critical` |
| `>= 7.0` | `high` |
| `>= 4.0` | `medium` |
| `> 0` | `low` |

## Quality Gate Logic

The evaluator counts findings at or above the configured threshold:

| Threshold | Fails on |
| --------- | -------- |
| `critical` | critical |
| `high` | high, critical |
| `medium` | medium, high, critical |
| `low` | low, medium, high, critical |

`fail_on_count` is an additional total-finding limit. If either rule fails, `blocked=true`, `quality_gate_status=FAIL`, `core.setFailed()` is called, and the process exits with code `1`.

## Extension Points

New scanner behavior should be added in `parser/normalizer.ts` only when SARIF fields need special interpretation. New reporting formats should use `MarkdownContext` from `formatters/markdown.ts` so summaries, PR comments, and JSON reports remain consistent.

## Security Model

QualityGate performs no shell execution using user inputs. File inputs are resolved through filesystem APIs and `fast-glob`. Markdown output is escaped for table-sensitive characters. GitHub API operations use retry logic and least-privilege token permissions.
