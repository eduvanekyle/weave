import { useState } from 'react'
import { Braces, Check, Copy, Minimize2, Trash2 } from 'lucide-react'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'
import { ToolPageHeader } from '../components/ToolPageHeader'

const TEXTAREA_CLASS =
    'min-h-72 w-full resize-y rounded-b-lg border-0 bg-[var(--color-input)] px-3 py-3 font-mono text-sm leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus-visible:outline-none'

function EditorPane({
    id,
    label,
    value,
    placeholder,
    readOnly,
    onChange,
}: {
    id: string
    label: string
    value: string
    placeholder?: string
    readOnly?: boolean
    onChange?: (value: string) => void
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
                onChange={(event) => onChange?.(event.target.value)}
                placeholder={placeholder}
                readOnly={readOnly}
                aria-live={readOnly ? 'polite' : undefined}
                spellCheck={false}
            />
        </div>
    )
}

export function JsonFormatter() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const formatJson = (minify: boolean) => {
        setCopied(false)
        try {
            const parsed: unknown = JSON.parse(input)
            setOutput(JSON.stringify(parsed, null, minify ? undefined : 2))
            setError(null)
        } catch (cause) {
            setOutput('')
            setError(cause instanceof Error ? cause.message : 'Invalid JSON.')
        }
    }

    const copyOutput = async () => {
        try {
            await navigator.clipboard.writeText(output)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
        } catch {
            setError('Could not copy to the clipboard.')
        }
    }

    const clear = () => {
        setInput('')
        setOutput('')
        setError(null)
        setCopied(false)
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/developer-tools"
                backLabel="Back to Developer Tools"
                title="JSON Formatter & Validator"
                description="Validate JSON, then format it for readability or minify it. Your data stays in your browser."
            />
            <div className="grid gap-4 lg:grid-cols-2">
                <EditorPane
                    id="json-input"
                    label="JSON input"
                    value={input}
                    onChange={setInput}
                    placeholder='{"hello":"world"}'
                />
                <EditorPane id="json-output" label="Result" value={output} readOnly placeholder="Result appears here…" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
                <PrimaryButton onClick={() => formatJson(false)}>
                    <Braces size={16} aria-hidden="true" />
                    Format &amp; validate
                </PrimaryButton>
                <SecondaryButton onClick={() => formatJson(true)}>
                    <Minimize2 size={16} aria-hidden="true" />
                    Minify
                </SecondaryButton>
                <SecondaryButton onClick={copyOutput} disabled={!output}>
                    {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                    {copied ? 'Copied' : 'Copy'}
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
            {!error && output && (
                <p
                    className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-success"
                    role="status"
                >
                    Valid JSON.
                </p>
            )}
        </div>
    )
}
