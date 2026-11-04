import { useState } from 'react'
import { PrimaryButton } from '../components/PrimaryButton'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { createLineDiff, type DiffLine } from '../lib/textDiff'

const TEXTAREA_CLASS =
    'min-h-48 w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 font-mono text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)]'

export function TextJsonDiff() {
    const [mode, setMode] = useState<'text' | 'json'>('text')
    const [before, setBefore] = useState('')
    const [after, setAfter] = useState('')
    const [diffLines, setDiffLines] = useState<DiffLine[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    const compareText = () => {
        try {
            const formattedBefore = mode === 'json' ? JSON.stringify(JSON.parse(before), null, 2) : before
            const formattedAfter = mode === 'json' ? JSON.stringify(JSON.parse(after), null, 2) : after
            if (formattedBefore.length > 100_000 || formattedAfter.length > 100_000) {
                throw new Error('Each input must be 100,000 characters or fewer.')
            }
            const oldLineCount = formattedBefore.split(/\r?\n/).length
            const newLineCount = formattedAfter.split(/\r?\n/).length
            if (oldLineCount * newLineCount > 300_000) {
                throw new Error('These inputs contain too many lines to compare at once. Try shorter text.')
            }
            setDiffLines(createLineDiff(formattedBefore, formattedAfter))
            setError(null)
        } catch (cause) {
            setDiffLines(null)
            setError(
                mode === 'json' && cause instanceof SyntaxError
                    ? `Both inputs must be valid JSON. ${cause.message}`
                    : cause instanceof Error
                        ? cause.message
                        : 'Unable to compare these inputs.',
            )
        }
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/developer-tools"
                backLabel="Back to Developer Tools"
                title="Text / JSON Diff"
                description="Compare two snippets line by line. JSON mode formats both inputs before comparison."
            />
            <label htmlFor="diff-mode" className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Comparison mode
            </label>
            <select
                id="diff-mode"
                className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]"
                value={mode}
                onChange={(event) => setMode(event.target.value as 'text' | 'json')}
            >
                <option value="text">Text</option>
                <option value="json">JSON</option>
            </select>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                    <label htmlFor="diff-before" className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                        Original
                    </label>
                    <textarea id="diff-before" className={TEXTAREA_CLASS} value={before} onChange={(event) => setBefore(event.target.value)} />
                </div>
                <div>
                    <label htmlFor="diff-after" className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                        Updated
                    </label>
                    <textarea id="diff-after" className={TEXTAREA_CLASS} value={after} onChange={(event) => setAfter(event.target.value)} />
                </div>
            </div>
            <PrimaryButton className="mt-4" onClick={compareText}>Compare</PrimaryButton>
            {error && <p className="mt-3 text-sm text-danger" role="alert">{error}</p>}
            {diffLines && (
                <div className="mt-4 max-h-96 overflow-auto rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-3" aria-label="Diff result" aria-live="polite">
                    <pre className="font-mono text-sm">
                        {diffLines.map((line, index) => (
                            <span
                                key={`${index}-${line.kind}`}
                                className={`block whitespace-pre-wrap break-all ${
                                    line.kind === 'added'
                                        ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                                        : line.kind === 'removed'
                                            ? 'bg-red-500/10 text-red-700 dark:text-red-300'
                                            : 'text-[var(--color-text-muted)]'
                                }`}
                            >
                                {line.kind === 'added' ? '+ ' : line.kind === 'removed' ? '- ' : '  '}{line.text || ' '}
                            </span>
                        ))}
                    </pre>
                </div>
            )}
        </div>
    )
}
