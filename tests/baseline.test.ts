import { BaselineComparator } from '../src/quality/baseline';
import { Finding } from '../src/types/sarif';

const makeFinding = (fingerprint: string): Finding => ({
    ruleId: 'rule',
    severity: 'high',
    message: 'issue',
    file: 'src/app.ts',
    line: 1,
    tool: 'Test',
    runIndex: 0,
    resultIndex: 0,
    suppressed: false,
    uniqueId: fingerprint,
    fingerprint,
});

describe('BaselineComparator', () => {
    it('suppresses findings that exist in baseline', () => {
        const comparator = new BaselineComparator();
        const filtered = comparator.suppressBaselineFindings(
            [makeFinding('same'), makeFinding('new')],
            [makeFinding('same')]
        );

        expect(filtered.map(finding => finding.fingerprint)).toEqual(['new']);
    });
});
