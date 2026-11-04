import { useState } from 'react'
import { PrimaryButton } from '../components/PrimaryButton'
import { ToolPageHeader } from '../components/ToolPageHeader'

const TEXTAREA_CLASS =
    'min-h-36 w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 font-mono text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)]'

export function Sha256HashGenerator() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isHashing, setIsHashing] = useState(false)

    const generateHash = async () => {
        setError(null)
        setOutput('')
        if (!globalThis.crypto?.subtle) {
            setError('SHA-256 is unavailable. Use a modern browser in a secure context (HTTPS or localhost).')
            return
        }
        setIsHashing(true)
        try {
            const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
            setOutput(Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(''))
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Unable to generate a SHA-256 hash.')
        } finally {
            setIsHashing(false)
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/developer-tools"
                backLabel="Back to Developer Tools"
                title="SHA-256 Hash Generator"
                description="Generate a SHA-256 digest from text using your browser. The input is not uploaded."
            />
            <label htmlFor="hash-input" className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Text to hash
            </label>
            <textarea id="hash-input" className={TEXTAREA_CLASS} value={input} onChange={(event) => setInput(event.target.value)} />
            <PrimaryButton className="mt-4" onClick={generateHash} disabled={isHashing}>
                {isHashing ? 'Generating…' : 'Generate SHA-256'}
            </PrimaryButton>
            {error && <p className="mt-3 text-sm text-danger" role="alert">{error}</p>}
            {output && (
                <div className="mt-4">
                    <label htmlFor="hash-output" className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                        SHA-256
                    </label>
                    <textarea id="hash-output" className={`${TEXTAREA_CLASS} min-h-20 break-all`} value={output} readOnly />
                </div>
            )}
        </div>
    )
}
