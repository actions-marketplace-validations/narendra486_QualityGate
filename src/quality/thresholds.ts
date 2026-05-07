import { Finding, Severity, SeverityCounts } from '../types/sarif';
import { SeverityUtils } from '../utils/severity';

export class SeverityCounter {
    count(findings: Finding[]): SeverityCounts {
        const counts: SeverityCounts = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            total: findings.length,
        };

        for (const finding of findings) {
            counts[finding.severity]++;
        }

        return counts;
    }

    countBySeverity(findings: Finding[], severity: Severity): number {
        return findings.filter(f => f.severity === severity).length;
    }

    countAtOrAboveSeverity(findings: Finding[], threshold: Severity): number {
        return findings.filter(f => SeverityUtils.isAtOrAboveThreshold(f.severity, threshold)).length;
    }
}
