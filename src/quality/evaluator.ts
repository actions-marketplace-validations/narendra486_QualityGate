import { Finding, QualityGateResult, Severity } from '../types/sarif';
import { SeverityCounter } from './thresholds';
import * as core from '@actions/core';

export class QualityGateEvaluator {
    private counter = new SeverityCounter();

    evaluate(
        findings: Finding[],
        threshold: Severity,
        failOnCount?: number
    ): QualityGateResult {
        const counts = this.counter.count(findings);
        const reasons: string[] = [];
        const countAtOrAboveThreshold = this.counter.countAtOrAboveSeverity(findings, threshold);

        if (countAtOrAboveThreshold > 0) {
            reasons.push(`${countAtOrAboveThreshold} finding(s) at or above ${threshold}`);
            core.info(
                `Found ${countAtOrAboveThreshold} findings at or above threshold "${threshold}"`
            );
        }

        if (failOnCount !== undefined && counts.total > failOnCount) {
            reasons.push(`${counts.total} total finding(s) exceeds fail_on_count ${failOnCount}`);
            core.info(`Found ${counts.total} findings, exceeds limit of ${failOnCount}`);
        }

        const passed = reasons.length === 0;

        return {
            passed,
            blocked: !passed,
            counts,
            findings,
            threshold,
            failOnCount,
            thresholdFindingCount: countAtOrAboveThreshold,
            reasons,
        };
    }

    generateSummary(result: QualityGateResult): string {
        const { counts, passed, threshold } = result;
        const status = passed ? '✅ PASS' : '❌ FAIL';

        return `${status} | Threshold: ${threshold} | Critical: ${counts.critical} | High: ${counts.high} | Medium: ${counts.medium} | Low: ${counts.low}`;
    }
}
