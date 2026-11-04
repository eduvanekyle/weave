import { useMemo, useState } from 'react'
import { ArrowLeftRight, Braces, GitCompare, Trash2, Type } from 'lucide-react'
import clsx from 'clsx'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'
import { ToolPageHeader } from '../components/ToolPageHeader'
import { createLineDiff, type DiffLine } from '../lib/textDiff'

type Mode = 'text' | 'json'

const MODES: { value: Mode; label: string; icon: React.ReactNode }[] = [
    { value: 'text', label: 'Text', icon: <Type size={15} aria-hidden="true" /> },
    { value: 'json', label: 'JSON', icon: <Braces size={15} aria-hidden="true" /> },
]

const TEXTAREA_CLASS =
    'min-h-56 w-full resize-y rounded-b-lg border-0 bg-[var(--color-input)] px-3 py-3 font-mono text-sm leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus-visible:outline-none'

const LINE_STYLES = {
    added: {
        row: 'bg-green-500/10',
        marker: 'text-green-600 dark:text-green-400',
        text: 'text-green-800 dark:text-green-200',
        symbol: '+',
    },
    removed: {
        row: 'bg-red-500/10',
        marker: 'text-red-600 dark:text-red-400',
        text: 'text-red-800 dark:text-red-200',
        symbol: '−',
    },
    same: {
        row: '',
        marker: 'text-[var(--color-text-subtle)]',
        text: 'text-[var(--color-text-muted)]',
        symbol: ' ',
    },
} as const

function EditorPane({
    id,
    label,
    value,
    placeholder,
    onChange,
}: {
    id: string
    label: string
    value: string
    placeholder: string
    onChange: (value: string) => void
}) {
    const lineCount = value ? value.split(/\r?\n/).length : 0

    return (
        <div className="overflow-hidden rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-input)] focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-hover)] px-3 py-2">
                <label htmlFor={id} className="text-sm font-medium text-[var(--color-text)]">
                    {label}
                </label>
                <span className="text-xs text-[var(--color-text-subtle)]">
                    {lineCount} {lineCount === 1 ? 'line' : 'lines'}
                </span>
            </div>
            <textarea
                id={id}
                className={TEXTAREA_CLASS}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                spellCheck={false}
            />
        </div>
    )
}

export function TextJsonDiff() {
    const [mode, setMode] = useState<Mode>('text')
    const [before, setBefore] = useState('')
    const [after, setAfter] = useState('')
    const [diffLines, setDiffLines] = useState<DiffLine[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    const numbered = useMemo(() => {
        if (!diffLines) return null
        let oldNumber = 0
        let newNumber = 0
        return diffLines.map((line) => {
            if (line.kind !== 'added') oldNumber += 1
            if (line.kind !== 'removed') newNumber += 1
            return {
                ...line,
                oldNumber: line.kind === 'added' ? null : oldNumber,
                newNumber: line.kind === 'removed' ? null : newNumber,
            }
        })
    }, [diffLines])

    const stats = useMemo(() => {
        const counts = { added: 0, removed: 0, same: 0 }
        diffLines?.forEach((line) => {
            counts[line.kind] += 1
        })
        return counts
    }, [diffLines])

    const changeMode = (next: Mode) => {
        if (next === mode) return
        setMode(next)
        setDiffLines(null)
        setError(null)
    }

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

    const swap = () => {
        setBefore(after)
        setAfter(before)
        setDiffLines(null)
    }

    const clear = () => {
        setBefore('')
        setAfter('')
        setDiffLines(null)
        setError(null)
    }

    const identical = diffLines !== null && stats.added === 0 && stats.removed === 0

    return (
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/developer-tools"
                backLabel="Back to Developer Tools"
                title="Text / JSON Diff"
                description="Compare two snippets line by line. JSON mode formats both inputs before comparison."
            />

            <div
                role="tablist"
                aria-label="Comparison mode"
                className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1"
            >
                {MODES.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        role="tab"
                        aria-selected={mode === option.value}
                        onClick={() => changeMode(option.value)}
                        className={clsx(
                            'inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                            mode === option.value
                                ? 'bg-accent text-white shadow-sm'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                        )}
                    >
                        {option.icon}
                        {option.label}
                    </button>
                ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <EditorPane
                    id="diff-before"
                    label="Original"
                    value={before}
                    onChange={setBefore}
                    placeholder={mode === 'json' ? '{"name": "Weave", "version": 1}' : 'Paste the original text…'}
                />
                <EditorPane
                    id="diff-after"
                    label="Updated"
                    value={after}
                    onChange={setAfter}
                    placeholder={mode === 'json' ? '{"name": "Weave", "version": 2}' : 'Paste the updated text…'}
                />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
                <PrimaryButton onClick={compareText}>
                    <GitCompare size={16} aria-hidden="true" />
                    Compare
                </PrimaryButton>
                <SecondaryButton onClick={swap}>
                    <ArrowLeftRight size={16} aria-hidden="true" />
                    Swap
                </SecondaryButton>
                <SecondaryButton onClick={clear}>
                    <Trash2 size={16} aria-hidden="true" />
                    Clear
                </SecondaryButton>
            </div>

            {error && (
                <p
                    className="mt-4 rounded-lg border border-red-500/30 bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-danger"
                    role="alert"
                >
                    {error}
                </p>
            )}

            {numbered && (
                <section className="mt-6 overflow-hidden rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)]">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)] px-4 py-3">
                        <h2 className="text-sm font-semibold text-[var(--color-text)]">Differences</h2>
                        <div className="flex flex-wrap gap-2 text-xs font-medium">
                            <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-green-700 dark:text-green-300">
                                +{stats.added} added
                            </span>
                            <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-red-700 dark:text-red-300">
                                −{stats.removed} removed
                            </span>
                            <span className="rounded-full bg-[var(--color-border)] px-2.5 py-1 text-[var(--color-text-muted)]">
                                {stats.same} unchanged
                            </span>
                        </div>
                    </div>

                    {identical && (
                        <p className="border-b border-[var(--color-border)] bg-[var(--color-success-soft)] px-4 py-2.5 text-sm font-medium text-success" role="status">
                            Both inputs are identical.
                        </p>
                    )}

                    <div className="max-h-[32rem] overflow-auto" aria-label="Diff result" aria-live="polite">
                        <table className="w-full border-collapse font-mono text-sm">
                            <tbody>
                                {numbered.map((line, index) => {
                                    const style = LINE_STYLES[line.kind]
                                    return (
                                        <tr key={`${index}-${line.kind}`} className={style.row}>
                                            <td className="w-12 select-none border-r border-[var(--color-border)] px-2 py-0.5 text-right align-top text-xs text-[var(--color-text-subtle)]">
                                                {line.oldNumber}
                                            </td>
                                            <td className="w-12 select-none border-r border-[var(--color-border)] px-2 py-0.5 text-right align-top text-xs text-[var(--color-text-subtle)]">
                                                {line.newNumber}
                                            </td>
                                            <td className={clsx('w-6 select-none px-2 py-0.5 text-center align-top font-semibold', style.marker)}>
                                                {style.symbol}
                                            </td>
                                            <td className={clsx('whitespace-pre-wrap break-all px-2 py-0.5', style.text)}>
                                                {line.text || ' '}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    )
}
