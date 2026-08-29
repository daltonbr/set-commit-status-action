// Plain CommonJS against the compiled output in lib/, which is what `npm run
// build` produces and what ncc then bundles into dist/. Node's built-in test
// runner is used deliberately: this repo ships a bundle to other people's
// runners, so not adding a test framework is worth a little verbosity.

const { strictEqual } = require('node:assert');
const { describe, it } = require('node:test');

const { getApiErrorMessage } = require('../lib/utils.js');

describe('getApiErrorMessage', () => {
    it('prefers response.data.errors when it is a string', () => {
        const error = Object.assign(new Error('Validation Failed'), {
            response: { data: { errors: 'Sha is not a valid commit' } },
        });

        strictEqual(getApiErrorMessage(error), 'Sha is not a valid commit');
    });

    it('falls back to the message when errors is an array', () => {
        // The shape the API returns most of the time. Deliberately not flattened,
        // so this documents that the elaborate path stays dormant for it.
        const error = Object.assign(new Error('Validation Failed'), {
            response: { data: { errors: [{ resource: 'Status', code: 'custom' }] } },
        });

        strictEqual(getApiErrorMessage(error), 'Validation Failed');
    });

    it('falls back to the message when there is no response', () => {
        strictEqual(getApiErrorMessage(new Error('Bad credentials')), 'Bad credentials');
    });

    it('does not throw when data is null', () => {
        const error = Object.assign(new Error('Not Found'), { response: { data: null } });

        strictEqual(getApiErrorMessage(error), 'Not Found');
    });

    it('does not throw when the response has no data', () => {
        const error = Object.assign(new Error('Server Error'), { response: {} });

        strictEqual(getApiErrorMessage(error), 'Server Error');
    });

    it('uses the message from an error-like object', () => {
        strictEqual(getApiErrorMessage({ message: 'Bad credentials' }), 'Bad credentials');
    });

    it('handles a thrown value that is not an Error', () => {
        strictEqual(getApiErrorMessage('boom'), 'boom');
    });

    it('handles a thrown null', () => {
        strictEqual(getApiErrorMessage(null), 'null');
    });
});
