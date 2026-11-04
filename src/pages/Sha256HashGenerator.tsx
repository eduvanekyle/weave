import { useState } from 'react'
import { Check, Copy, Hash, Trash2 } from 'lucide-react'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'
import { ToolPageHeader } from '../components/ToolPageHeader'

const TEXTAREA_CLASS =
    'w-full resize-y rounded-b-lg border-0 bg-[var(--color-input)] px-3 py-3 font-mono text-sm leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus-visible:outline-none'

function EditorPane({
    id,
    label,
    meta,
    children,
}: {
    id: string
    label: string
    meta: string
    children: React.ReactNode
}) {
    return (
        <div className="overflow-hidden rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-input)] focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-hover)] px-3 py-2">
                <label htmlFor={id} className="text-sm font-medium text-[var(--color-text)]">
                    {label}
                </label>
                <span className="text-xs text-[var(--color-text-subtle)]">{meta}</span>
            </div>
            {children}
        </div>
    )
}

export function Sha256HashGenerator() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isHashing, setIsHashing] = useState(false)
    const [copied, setCopied] = useState(false)

    const generateHash = async () => {
        setError(null)
        setOutput('')
        setCopied(false)
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

    const characterCount = [...input].length

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/developer-tools"
                backLabel="Back to Developer Tools"
                title="SHA-256 Hash Generator"
                description="Generate a SHA-256 digest from text using your browser. The input is not uploaded."
            />
            <EditorPane
                id="hash-input"
                label="Text to hash"
                meta={`${characterCount} ${characterCount === 1 ? 'character' : 'characters'}`}
            >
                <textarea
                    id="hash-input"
                    className={`${TEXTAREA_CLASS} min-h-40`}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Type or paste text to hash…"
                    spellCheck={false}
                />
            </EditorPane>
            <div className="mt-4 flex flex-wrap gap-3">
                <PrimaryButton onClick={generateHash} disabled={isHashing}>
                    <Hash size={16} aria-hidden="true" />
                    {isHashing ? 'Generating…' : 'Generate SHA-256'}
                </PrimaryButton>
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
            {output && (
                <div className="mt-6">
                    <EditorPane id="hash-output" label="SHA-256" meta="64 hex characters">
                        <textarea
                            id="hash-output"
                            className={`${TEXTAREA_CLASS} min-h-20 break-all`}
                            value={output}
                            readOnly
                            aria-live="polite"
                        />
                    </EditorPane>
                </div>
            )}
        </div>
    )
}
