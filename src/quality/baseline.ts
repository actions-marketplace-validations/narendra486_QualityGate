import * as core from '@actions/core';
import { Finding } from '../types/sarif';

export class BaselineComparator {
    suppressBaselineFindings(current: Finding[], baseline: Finding[]): Finding[] {
        if (baseline.length === 0) return current;

        const baselineFingerprints = new Set(baseline.map(finding => finding.fingerprint));
        const filtered = current.filter(finding => !baselineFingerprints.has(finding.fingerprint));
        const suppressed = current.length - filtered.length;

        if (suppressed > 0) {
            core.info(`Suppressed ${suppressed} finding(s) present in baseline`);
        }

        return filtered;
    }
}
