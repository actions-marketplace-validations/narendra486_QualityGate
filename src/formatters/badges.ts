import { Severity } from '../types/sarif';

const colors: Record<Severity, string> = {
    critical: 'red',
    high: 'orange',
    medium: 'yellow',
    low: 'blue',
};

export class BadgeFormatter {
    static severity(severity: Severity): string {
        const label = severity.charAt(0).toUpperCase() + severity.slice(1);
        return `![${label}](https://img.shields.io/badge/${label}-${colors[severity]}?style=flat-square)`;
    }

    static status(passed: boolean): string {
        return passed
            ? '![Quality Gate](https://img.shields.io/badge/Quality%20Gate-Passed-brightgreen?style=flat-square)'
            : '![Quality Gate](https://img.shields.io/badge/Quality%20Gate-Failed-red?style=flat-square)';
    }
}
