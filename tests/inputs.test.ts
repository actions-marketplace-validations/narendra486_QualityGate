import { getInput } from '@actions/core';
import { readInputs } from '../src/config/inputs';
import { QualityGateError } from '../src/utils/errors';

const mockedGetInput = getInput as jest.MockedFunction<typeof getInput>;

function setInputs(inputs: Record<string, string>): void {
    mockedGetInput.mockImplementation((name: string) => inputs[name] ?? '');
}

describe('readInputs', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('defaults optional flags to blocking high-and-critical policy', () => {
        setInputs({
            sarif_file: 'results.sarif',
            github_token: 'token',
        });

        const config = readInputs();

        expect(config.severityThreshold).toBe('high');
        expect(config.mode).toBe('block');
        expect(config.prComment).toBe(true);
        expect(config.deduplicate).toBe(true);
        expect(config.enableAnnotations).toBe(true);
        expect(config.enableStepSummary).toBe(true);
        expect(config.maxFindingsDisplay).toBe(100);
    });

    it('allows medium threshold when explicitly configured', () => {
        setInputs({
            sarif_file: 'results.sarif',
            severity_threshold: 'medium',
        });

        expect(readInputs().severityThreshold).toBe('medium');
    });

    it('rejects invalid severity_threshold values', () => {
        setInputs({
            sarif_file: 'results.sarif',
            severity_threshold: 'severe',
        });

        expect(() => readInputs()).toThrow(QualityGateError);
        expect(() => readInputs()).toThrow('severity_threshold must be one of: low, medium, high, critical');
    });

    it('rejects invalid mode values', () => {
        setInputs({
            sarif_file: 'results.sarif',
            mode: 'audit',
        });

        expect(() => readInputs()).toThrow(QualityGateError);
        expect(() => readInputs()).toThrow('mode must be one of: block, report');
    });
});
