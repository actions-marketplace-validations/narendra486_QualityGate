import * as core from '@actions/core';
import * as github from '@actions/github';
import { MarkdownContext, MarkdownFormatter } from '../formatters/markdown';
import { QUALITY_GATE_COMMENT_MARKER } from '../templates/default';
import { RetryHandler } from '../utils/retry';

export class PrCommentHandler {
    private readonly octokit: ReturnType<typeof github.getOctokit>;
    private readonly context = github.context;
    private readonly formatter = new MarkdownFormatter();

    constructor(githubToken: string) {
        this.octokit = github.getOctokit(githubToken);
    }

    async post(context: MarkdownContext): Promise<boolean> {
        if (!github.context.payload.pull_request) {
            core.info('Not a pull request event, skipping PR comment');
            return false;
        }

        const prNumber = github.context.payload.pull_request.number;
        const { owner, repo } = this.context.repo;
        const body = this.formatter.formatPrComment(context);

        const comments = (await RetryHandler.execute(
            () => this.octokit.paginate(this.octokit.rest.issues.listComments, { owner, repo, issue_number: prNumber }),
            { maxAttempts: 3, delayMs: 750 }
        )) as Array<{ id: number; body?: string | null }>;
        const existing = comments.filter(comment => comment.body?.includes(QUALITY_GATE_COMMENT_MARKER));

        if (existing.length > 0) {
            const primary = existing[0];
            if (!primary) return false;
            const duplicates = existing.slice(1);
            await RetryHandler.execute(
                () => this.octokit.rest.issues.updateComment({ owner, repo, comment_id: primary.id, body }),
                { maxAttempts: 3, delayMs: 750 }
            );

            for (const duplicate of duplicates) {
                await RetryHandler.execute(
                    () => this.octokit.rest.issues.deleteComment({ owner, repo, comment_id: duplicate.id }),
                    { maxAttempts: 2, delayMs: 500 }
                );
            }
            core.info(`Updated QualityGate PR comment ${primary.id}`);
            return true;
        }

        await RetryHandler.execute(
            () => this.octokit.rest.issues.createComment({ owner, repo, issue_number: prNumber, body }),
            { maxAttempts: 3, delayMs: 750 }
        );
        core.info('Created QualityGate PR comment');
        return true;
    }
}
