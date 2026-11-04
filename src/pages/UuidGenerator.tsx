import { useState } from 'react'
import { PrimaryButton } from '../components/PrimaryButton'
import { ToolPageHeader } from '../components/ToolPageHeader'

export function UuidGenerator() {
    const [uuid, setUuid] = useState('')
    const [error, setError] = useState<string | null>(null)

    const generateUuid = () => {
        if (!globalThis.crypto?.randomUUID) {
            setError('UUID generation is not available in this browser.')
            return
        }
        setUuid(globalThis.crypto.randomUUID())
        setError(null)
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/developer-tools"
                backLabel="Back to Developer Tools"
                title="UUID Generator"
                description="Generate a random version 4 UUID locally in your browser."
            />
            <div className="flex flex-col gap-3 sm:flex-row">
                <input
                    className="min-w-0 flex-1 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-input)] px-3 py-2 font-mono text-sm text-[var(--color-text)]"
                    value={uuid}
                    readOnly
                    aria-label="Generated UUID"
                    placeholder="Your UUID will appear here"
                />
                <PrimaryButton onClick={generateUuid}>Generate UUID</PrimaryButton>
            </div>
            {error && <p className="mt-3 text-sm text-danger" role="alert">{error}</p>}
        </div>
    )
}
