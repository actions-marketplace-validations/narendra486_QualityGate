import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { SarifAggregator } from '../src/parser/aggregator';
import { resolveSarifFiles } from '../src/utils/glob';

describe('SarifAggregator', () => {
    it('aggregates multiple files and gracefully skips malformed SARIF', async () => {
        const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'qualitygate-'));
        const good = path.join(dir, 'good.sarif');
        const bad = path.join(dir, 'bad.sarif');
        await fs.writeFile(
            good,
            JSON.stringify({
                version: '2.1.0',
                runs: [
                    {
                        tool: { driver: { name: 'Semgrep' } },
                        results: [
                            {
                                ruleId: 'javascript.lang.security.audit',
                                level: 'warning',
                                message: { text: 'audit finding' },
                                locations: [
                                    {
                                        physicalLocation: {
                                            artifactLocation: { uri: 'src/index.js' },
                                            region: { startLine: 7 },
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            })
        );
        await fs.writeFile(bad, '{ nope');

        const files = await resolveSarifFiles(dir);
        const aggregation = await new SarifAggregator().aggregate(files);

        expect(aggregation.findings).toHaveLength(1);
        expect(aggregation.processedFiles).toContain(good);
        expect(aggregation.skippedFiles).toContain(bad);
        expect(aggregation.metadata.find(item => item.file === bad)?.malformed).toBe(true);
    });
});
