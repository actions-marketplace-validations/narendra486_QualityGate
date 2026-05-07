import { QualityGateEvaluator } from '../src/quality/evaluator';
import { Finding } from '../src/types/sarif';

const finding = (severity: Finding['severity']): Finding => ({
    ruleId: `rule-${severity}`,
    severity,
    message: `${severity} issue`,
    file: 'src/app.ts',
    line: 1,
    tool: 'Test',
    runIndex: 0,
    resultIndex: 0,
    suppressed: false,
    uniqueId: severity,
    fingerprint: severity,
});

describe('QualityGateEvaluator', () => {
    const evaluator = new QualityGateEvaluator();

    it('fails when findings are at or above threshold', () => {
        const result = evaluator.evaluate([finding('medium'), finding('high')], 'high');
        expect(result.passed).toBe(false);
        expect(result.blocked).toBe(true);
        expect(result.thresholdFindingCount).toBe(1);
    });

    it('passes when findings are below threshold', () => {
        const result = evaluator.evaluate([finding('low'), finding('medium')], 'high');
        expect(result.passed).toBe(true);
        expect(result.blocked).toBe(false);
    });

    it('honors fail_on_count', () => {
        const result = evaluator.evaluate([finding('low'), finding('low')], 'critical', 1);
        expect(result.passed).toBe(false);
        expect(result.reasons[0]).toContain('exceeds fail_on_count');
    });
});
