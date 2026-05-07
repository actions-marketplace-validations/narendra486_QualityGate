# Example Workflows

These examples show scanner-specific SARIF production followed by QualityGate enforcement. Repository workflows pin third-party actions to commit SHAs; scanner CLIs are installed from package ecosystems or containers at explicit versions where practical.

## CodeQL

```yaml
name: CodeQL QualityGate

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read
  pull-requests: write
  checks: write
  security-events: read

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5

      - name: Initialize CodeQL
        uses: github/codeql-action/init@53e96ec3b35fce51c141c0d6f0e31028a448722d
        with:
          languages: javascript

      - name: Autobuild
        uses: github/codeql-action/autobuild@53e96ec3b35fce51c141c0d6f0e31028a448722d

      - name: Analyze
        uses: github/codeql-action/analyze@53e96ec3b35fce51c141c0d6f0e31028a448722d
        with:
          output: sarif-results

      - name: Quality Gate
        uses: your-org/QualityGate@v1
        with:
          sarif_file: sarif-results/javascript.sarif
          severity_threshold: high
          github_token: ${{ secrets.GITHUB_TOKEN }}
          pr_comment: true
          enable_annotations: true
          enable_step_summary: true
```

## Trivy

```yaml
name: Trivy QualityGate

on: [pull_request]

permissions:
  contents: read
  pull-requests: write
  checks: write

jobs:
  trivy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5

      - name: Run Trivy
        run: |
          docker run --rm -v "$PWD:/work" -w /work aquasec/trivy:0.57.1 fs --format sarif --output trivy.sarif .

      - name: Quality Gate
        uses: your-org/QualityGate@v1
        with:
          sarif_file: trivy.sarif
          severity_threshold: high
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Semgrep

```yaml
name: Semgrep QualityGate

on: [pull_request]

permissions:
  contents: read
  pull-requests: write
  checks: write

jobs:
  semgrep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5

      - name: Run Semgrep
        run: |
          python -m pip install semgrep==1.96.0
          semgrep scan --config auto --sarif --output semgrep.sarif

      - name: Quality Gate
        uses: your-org/QualityGate@v1
        with:
          sarif_file: semgrep.sarif
          severity_threshold: medium
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Snyk

```yaml
name: Snyk QualityGate

on: [pull_request]

permissions:
  contents: read
  pull-requests: write
  checks: write

jobs:
  snyk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5

      - name: Run Snyk
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        run: |
          npm install -g snyk@1.1295.0
          snyk test --sarif-file-output=snyk.sarif || true

      - name: Quality Gate
        uses: your-org/QualityGate@v1
        with:
          sarif_file: snyk.sarif
          severity_threshold: high
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Checkov

```yaml
name: Checkov QualityGate

on: [pull_request]

permissions:
  contents: read
  pull-requests: write
  checks: write

jobs:
  checkov:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5

      - name: Run Checkov
        run: |
          python -m pip install checkov==3.2.330
          checkov -d . -o sarif --output-file-path checkov.sarif || true

      - name: Quality Gate
        uses: your-org/QualityGate@v1
        with:
          sarif_file: checkov.sarif
          severity_threshold: medium
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Multi-Scanner Aggregation

```yaml
name: Multi Scanner QualityGate

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read
  pull-requests: write
  checks: write

jobs:
  aggregate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5

      - name: Run scanners
        run: |
          mkdir -p sarif-results
          docker run --rm -v "$PWD:/work" -w /work aquasec/trivy:0.57.1 fs --format sarif --output sarif-results/trivy.sarif .
          python -m pip install semgrep==1.96.0 checkov==3.2.330
          semgrep scan --config auto --sarif --output sarif-results/semgrep.sarif || true
          checkov -d . -o sarif --output-file-path sarif-results/checkov.sarif || true

      - name: Quality Gate
        uses: your-org/QualityGate@v1
        with:
          sarif_file: sarif-results
          severity_threshold: high
          fail_on_count: 50
          github_token: ${{ secrets.GITHUB_TOKEN }}
          pr_comment: true
          json_export_file: qualitygate-report.json
```
