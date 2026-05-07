import { Severity } from '../types/sarif';

const order: Record<Severity, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
};

export class SeverityUtils {
    static readonly severities: Severity[] = ['low', 'medium', 'high', 'critical'];

    static normalize(value: unknown): Severity {
        const text = String(value ?? '').trim().toLowerCase();
        const numeric = Number.parseFloat(text);

        if (!Number.isNaN(numeric)) {
            if (numeric >= 9) return 'critical';
            if (numeric >= 7) return 'high';
            if (numeric >= 4) return 'medium';
            if (numeric > 0) return 'low';
        }

        if (['critical', 'crit', 'very-high', 'severe'].includes(text)) return 'critical';
        if (['high', 'error', 'failure', 'fail', 'important'].includes(text)) return 'high';
        if (['medium', 'moderate', 'warning', 'warn'].includes(text)) return 'medium';
        if (['low', 'note', 'notice', 'none', 'informational', 'info', 'recommendation'].includes(text)) {
            return 'low';
        }

        return 'low';
    }

    static isValid(value: string): value is Severity {
        return this.severities.includes(value as Severity);
    }

    static getSeverityIndex(severity: Severity): number {
        return order[severity];
    }

    static isAtOrAboveThreshold(severity: Severity, threshold: Severity): boolean {
        return order[severity] >= order[threshold];
    }

    static compareDescending(a: Severity, b: Severity): number {
        return order[b] - order[a];
    }

    static getSeverityLabel(severity: Severity): string {
        return severity.charAt(0).toUpperCase() + severity.slice(1);
    }

    static getEmoji(severity: Severity): string {
        switch (severity) {
            case 'critical':
                return '🔴';
            case 'high':
                return '🟠';
            case 'medium':
                return '🟡';
            case 'low':
                return '🔵';
        }
    }

    static getAnnotationLevel(severity: Severity): 'notice' | 'warning' | 'error' {
        if (severity === 'critical' || severity === 'high') return 'error';
        if (severity === 'medium') return 'warning';
        return 'notice';
    }
}
