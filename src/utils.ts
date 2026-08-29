import { context } from '@actions/github';
import type { PullRequest } from '@octokit/webhooks-types';

export type CommitStatusState = 'error' | 'failure' | 'pending' | 'success';

/**
 * The shape we read off a failed API call. Only the one field we actually use,
 * described locally rather than imported from `@octokit/request-error`.
 *
 * Every level is optional because none of it is guaranteed: the throw may not be
 * a request error at all, and `data` has been observed as `null`. Reading it
 * structurally also avoids `instanceof RequestError`, which fails silently when
 * more than one copy of that package ends up in the tree.
 */
interface RequestErrorLike {
    message?: string;
    response?: {
        data?: {
            errors?: unknown;
        };
    };
}

/**
 * Returns the most specific message available for a failed API call.
 *
 * The GitHub API sometimes puts a useful explanation in `response.data.errors`
 * while `error.message` is only "Validation Failed". Prefer the former when it
 * is a string, and fall back to the error's own message otherwise.
 */
export function getApiErrorMessage(error: unknown): string {
    const errorLike = error as RequestErrorLike | null;

    if (typeof errorLike?.response?.data?.errors === 'string') {
        return errorLike.response.data.errors;
    }

    // Read `message` structurally rather than testing `instanceof Error`, for the
    // same reason as above, and so an error-like object that carries a message
    // still reports it instead of being stringified to "[object Object]".
    if (typeof errorLike?.message === 'string') {
        return errorLike.message;
    }

    return String(error);
}

function isPullRequest(): boolean {
    return context.eventName === 'pull_request';
}

function isPush(): boolean {
    return context.eventName === 'push';
}

export function isForeignPullRequest(): boolean {
    const { payload } = context;
    if (payload.pull_request) {
        const pr = payload.pull_request as PullRequest;
        const baseRepo = pr.base.repo.full_name;
        const headRepo = pr.head.repo?.full_name;

        return baseRepo !== headRepo;
    }

    return false;
}

function getSHA(): string | null {
    const { payload } = context;
    switch (true) {
        case isPullRequest():
            return (payload.pull_request as PullRequest).head.sha;

        case isPush():
            return context.sha;

        default:
            return null;
    }
}

export function validateCommitStatusState(state: string): CommitStatusState {
    const allowedStates: Record<CommitStatusState, boolean> = {
        error: true,
        failure: true,
        pending: true,
        success: true,
    };

    if (state === 'cancelled') {
        return 'error';
    }

    if (!(state in allowedStates)) {
        throw new Error('state must be one of "error", "failure", "pending", "success"');
    }

    return state as CommitStatusState;
}

export function getCommitHash(sha: string): string {
    const commit = sha || getSHA();
    if (!commit) {
        throw new Error('Unable to determine the commit hash. Please provide the `sha` parameter');
    }

    return commit;
}

export function parseRepoName(repository: string): [owner: string, repo: string] {
    let owner: string;
    let repo: string;
    if (repository) {
        [owner, repo] = repository.split('/', 2);
    } else {
        ({ owner, repo } = context.repo);
    }

    return [owner, repo];
}
