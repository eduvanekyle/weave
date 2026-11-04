import { useState } from 'react'
import { Check, Copy, KeyRound, Trash2 } from 'lucide-react'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'
import { ToolPageHeader } from '../components/ToolPageHeader'

const CHARACTER_SETS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{};:,.<>?/~',
} as const

type SetName = keyof typeof CHARACTER_SETS

const SET_LABELS: Record<SetName, string> = {
    lowercase: 'Lowercase (a-z)',
    uppercase: 'Uppercase (A-Z)',
    numbers: 'Numbers (0-9)',
    symbols: 'Symbols (!@#…)',
}

const AMBIGUOUS = /[O0oIl1|]/g
const MIN_LENGTH = 4
const MAX_LENGTH = 128

// Rejection sampling avoids modulo bias.
function randomIndex(max: number): number {
    const limit = Math.floor(0x100000000 / max) * max
    const buffer = new Uint32Array(1)
    do {
        globalThis.crypto.getRandomValues(buffer)
    } while (buffer[0] >= limit)
    return buffer[0] % max
}

function pick(characters: string): string {
    return characters[randomIndex(characters.length)]
}

function generateString(length: number, sets: string[], pool: string): string {
    const characters = Array.from({ length }, () => pick(pool))
    // Guarantee at least one character from every selected set.
    sets.slice(0, length).forEach((set, position) => {
        characters[position] = pick(set)
    })
    for (let index = characters.length - 1; index > 0; index -= 1) {
        const swap = randomIndex(index + 1)
        ;[characters[index], characters[swap]] = [characters[swap], characters[index]]
    }
    return characters.join('')
}

function strengthLabel(bits: number): { label: string; className: string } {
    if (bits < 40) return { label: 'Weak', className: 'bg-red-500/15 text-red-700 dark:text-red-300' }
    if (bits < 60) return { label: 'Fair', className: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300' }
    if (bits < 100) return { label: 'Strong', className: 'bg-green-500/15 text-green-700 dark:text-green-300' }
    return { label: 'Very strong', className: 'bg-green-500/15 text-green-700 dark:text-green-300' }
}

export function PasswordGenerator() {
    const [length, setLength] = useState(20)
    const [enabled, setEnabled] = useState<Record<SetName, boolean>>({
        lowercase: true,
        uppercase: true,
        numbers: true,
        symbols: true,
    })
    const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
    const [count, setCount] = useState(1)
    const [output, setOutput] = useState('')
    const [entropy, setEntropy] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const generate = () => {
        setCopied(false)
        if (!globalThis.crypto?.getRandomValues) {
            setError('Secure random generation is not available in this browser.')
            return
        }
        const sets = (Object.keys(CHARACTER_SETS) as SetName[])
            .filter((name) => enabled[name])
            .map((name) => (excludeAmbiguous ? CHARACTER_SETS[name].replace(AMBIGUOUS, '') : CHARACTER_SETS[name]))
        if (sets.length === 0) {
            setOutput('')
            setError('Select at least one character type.')
            return
        }
        const safeLength = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.floor(length) || MIN_LENGTH))
        const safeCount = Math.min(20, Math.max(1, Math.floor(count) || 1))
        const pool = sets.join('')
        setLength(safeLength)
        setCount(safeCount)
        setOutput(Array.from({ length: safeCount }, () => generateString(safeLength, sets, pool)).join('\n'))
        setEntropy(safeLength * Math.log2(pool.length))
        setError(null)
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
        setOutput('')
        setError(null)
        setCopied(false)
    }

    const strength = output ? strengthLabel(entropy) : null
    const lineCount = output ? output.split('\n').length : 0

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/developer-tools"
                backLabel="Back to Developer Tools"
                title="Password / Random String Generator"
                description="Create secure random passwords and strings using your browser's cryptographic generator. Nothing is uploaded."
            />

            <section className="overflow-hidden rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)]">
                <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-hover)] px-4 py-2">
                    <h2 className="text-sm font-medium text-[var(--color-text)]">Options</h2>
                </div>
                <div className="grid gap-5 p-4 sm:grid-cols-2">
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label htmlFor="password-length" className="text-sm font-medium text-[var(--color-text)]">
                                Length
                            </label>
                            <span className="text-sm tabular-nums text-[var(--color-text-muted)]">{length}</span>
                        </div>
                        <input
                            id="password-length"
                            type="range"
                            min={MIN_LENGTH}
                            max={MAX_LENGTH}
                            value={length}
                            onChange={(event) => setLength(Number(event.target.value))}
                            className="w-full accent-[var(--color-accent)]"
                        />
                    </div>
                    <div>
                        <label htmlFor="password-count" className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                            Number of passwords (1–20)
                        </label>
                        <input
                            id="password-count"
                            type="number"
                            min={1}
                            max={20}
                            value={count}
                            onChange={(event) => setCount(Number(event.target.value))}
                            className="w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-text)]"
                        />
                    </div>
                    <fieldset className="sm:col-span-2">
                        <legend className="mb-2 text-sm font-medium text-[var(--color-text)]">Characters</legend>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {(Object.keys(CHARACTER_SETS) as SetName[]).map((name) => (
                                <label key={name} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                                    <input
                                        type="checkbox"
                                        checked={enabled[name]}
                                        onChange={(event) => setEnabled((current) => ({ ...current, [name]: event.target.checked }))}
                                        className="h-4 w-4 accent-[var(--color-accent)]"
                                    />
                                    {SET_LABELS[name]}
                                </label>
                            ))}
                            <label className="flex items-center gap-2 text-sm text-[var(--color-text)] sm:col-span-2">
                                <input
                                    type="checkbox"
                                    checked={excludeAmbiguous}
                                    onChange={(event) => setExcludeAmbiguous(event.target.checked)}
                                    className="h-4 w-4 accent-[var(--color-accent)]"
                                />
                                Exclude look-alike characters (O, 0, I, l, 1, |)
                            </label>
                        </div>
                    </fieldset>
                </div>
            </section>

            <div className="mt-4 flex flex-wrap gap-3">
                <PrimaryButton onClick={generate}>
                    <KeyRound size={16} aria-hidden="true" />
                    Generate
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

            <div className="mt-6 overflow-hidden rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-input)] focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-hover)] px-3 py-2">
                    <label htmlFor="password-output" className="text-sm font-medium text-[var(--color-text)]">
                        Result
                    </label>
                    <span className="flex items-center gap-2 text-xs text-[var(--color-text-subtle)]">
                        {strength && (
                            <span className={`rounded-full px-2 py-0.5 font-medium ${strength.className}`}>{strength.label}</span>
                        )}
                        {lineCount} {lineCount === 1 ? 'line' : 'lines'}
                    </span>
                </div>
                <textarea
                    id="password-output"
                    className="min-h-28 w-full resize-y rounded-b-lg border-0 bg-[var(--color-input)] px-3 py-3 font-mono text-sm leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus-visible:outline-none"
                    value={output}
                    readOnly
                    aria-live="polite"
                    placeholder="Your generated passwords will appear here…"
                    spellCheck={false}
                />
            </div>
        </div>
    )
}
