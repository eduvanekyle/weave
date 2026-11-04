import { useState } from 'react'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'
import { ToolPageHeader } from '../components/ToolPageHeader'

const TEXTAREA_CLASS =
    'min-h-48 w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 font-mono text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)]'

export function JsonFormatter() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [error, setError] = useState<string | null>(null)

    const formatJson = (minify: boolean) => {
        try {
            const parsed: unknown = JSON.parse(input)
            setOutput(JSON.stringify(parsed, null, minify ? undefined : 2))
            setError(null)
        } catch (cause) {
            setOutput('')
            setError(cause instanceof Error ? cause.message : 'Invalid JSON.')
        }
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/developer-tools"
                backLabel="Back to Developer Tools"
                title="JSON Formatter & Validator"
                description="Validate JSON, then format it for readability or minify it. Your data stays in your browser."
            />
            <div className="grid gap-4 lg:grid-cols-2">
                <div>
                    <label htmlFor="json-input" className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                        JSON input
                    </label>
                    <textarea
                        id="json-input"
                        className={TEXTAREA_CLASS}
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder='{"hello":"world"}'
                        spellCheck={false}
                    />
                </div>
                <div>
                    <label htmlFor="json-output" className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                        Result
                    </label>
                    <textarea id="json-output" className={TEXTAREA_CLASS} value={output} readOnly aria-live="polite" />
                </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
                <PrimaryButton onClick={() => formatJson(false)}>Format &amp; validate</PrimaryButton>
                <SecondaryButton onClick={() => formatJson(true)}>Minify</SecondaryButton>
            </div>
            {error && <p className="mt-3 text-sm text-danger" role="alert">{error}</p>}
            {!error && output && <p className="mt-3 text-sm text-success" role="status">Valid JSON.</p>}
        </div>
    )
}
