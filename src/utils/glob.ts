import { FileHandler } from './file';

export async function resolveSarifFiles(input: string): Promise<string[]> {
    const files: string[] = [];
    const patterns = input
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    for (const pattern of patterns) {
        if (/[*?[\]{}]/.test(pattern)) {
            files.push(...(await FileHandler.expandGlob(pattern)));
            continue;
        }

        const resolvedPaths = FileHandler.resolvePaths([pattern]);
        for (const resolved of resolvedPaths) {
            files.push(...(await FileHandler.collectSarifFilesFromPath(resolved)));
        }
    }

    return [...new Set(files)].sort();
}
