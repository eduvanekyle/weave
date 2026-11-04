import { useState } from 'react'
import { Check, Copy, TextQuote, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'
import { ToolPageHeader } from '../components/ToolPageHeader'

type Unit = 'paragraphs' | 'sentences' | 'words'

const UNITS: { value: Unit; label: string; max: number }[] = [
    { value: 'paragraphs', label: 'Paragraphs', max: 50 },
    { value: 'sentences', label: 'Sentences', max: 200 },
    { value: 'words', label: 'Words', max: 2000 },
]

const OPENING = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'

const WORDS = (
    'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ' +
    'enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in ' +
    'reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa ' +
    'qui officia deserunt mollit anim id est laborum'
).split(' ')

const randomInt = (min: number, max: number) => {
    const buffer = new Uint32Array(1)
    globalThis.crypto.getRandomValues(buffer)
    return min + (buffer[0] % (max - min + 1))
}

const randomWords = (count: number) => Array.from({ length: count }, () => WORDS[randomInt(0, WORDS.length - 1)])

function buildSentence(): string {
    const words = randomWords(randomInt(6, 14))
    if (words.length > 8) {
        words[randomInt(3, words.length - 4)] += ','
    }
    const sentence = words.join(' ')
    return `${sentence[0].toUpperCase()}${sentence.slice(1)}.`
}

function generate(unit: Unit, amount: number, startWithLorem: boolean): string {
    let result: string
    if (unit === 'words') {
        result = randomWords(amount).join(' ')
        if (startWithLorem) {
            const opening = OPENING.replace(',', '').toLowerCase().split(' ')
            result = [...opening, ...result.split(' ')].slice(0, amount).join(' ')
        }
        return `${result[0].toUpperCase()}${result.slice(1)}`
    }

    const buildSentences = (count: number, first: boolean) =>
        Array.from({ length: count }, (_, index) => (first && index === 0 ? `${OPENING}.` : buildSentence()))

    if (unit === 'sentences') {
        return buildSentences(amount, startWithLorem).join(' ')
    }

    return Array.from({ length: amount }, (_, index) =>
        buildSentences(randomInt(4, 7), startWithLorem && index === 0).join(' '),
    ).join('\n\n')
}

export function LoremIpsumGenerator() {
    const [unit, setUnit] = useState<Unit>('paragraphs')
    const [amount, setAmount] = useState(3)
    const [startWithLorem, setStartWithLorem] = useState(true)
    const [output, setOutput] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const current = UNITS.find((item) => item.value === unit) ?? UNITS[0]

    const run = () => {
        setCopied(false)
        if (!globalThis.crypto?.getRandomValues) {
            setError('Random generation is not available in this browser.')
            return
        }
        const safeAmount = Math.min(current.max, Math.max(1, Math.floor(amount) || 1))
        setAmount(safeAmount)
        setOutput(generate(unit, safeAmount, startWithLorem))
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

    const wordCount = output ? output.split(/\s+/).length : 0

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/developer-tools"
                backLabel="Back to Developer Tools"
                title="Lorem Ipsum Generator"
                description="Generate placeholder text as paragraphs, sentences, or words. Everything is created in your browser."
            />

            <section className="overflow-hidden rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)]">
                <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-hover)] px-4 py-2">
                    <h2 className="text-sm font-medium text-[var(--color-text)]">Options</h2>
                </div>
                <div className="flex flex-col gap-5 p-4">
                    <div
                        role="tablist"
                        aria-label="Unit"
                        className="inline-flex self-start rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1"
                    >
                        {UNITS.map((item) => {
                            const active = item.value === unit
                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => {
                                        setUnit(item.value)
                                        setAmount((value) => Math.min(value, item.max))
                                    }}
                                    className={clsx(
                                        'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                                        active
                                            ? 'bg-accent text-white'
                                            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]',
                                    )}
                                >
                                    {item.label}
                                </button>
                            )
                        })}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
                        <div>
                            <label htmlFor="lorem-amount" className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                                Amount (1–{current.max})
                            </label>
                            <input
                                id="lorem-amount"
                                type="number"
                                min={1}
                                max={current.max}
                                value={amount}
                                onChange={(event) => setAmount(Number(event.target.value))}
                                className="w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-text)]"
                            />
                        </div>
                        <label className="flex items-center gap-2 pb-2 text-sm text-[var(--color-text)]">
                            <input
                                type="checkbox"
                                checked={startWithLorem}
                                onChange={(event) => setStartWithLorem(event.target.checked)}
                                className="h-4 w-4 accent-[var(--color-accent)]"
                            />
                            Start with “Lorem ipsum dolor sit amet…”
                        </label>
                    </div>
                </div>
            </section>

            <div className="mt-4 flex flex-wrap gap-3">
                <PrimaryButton onClick={run}>
                    <TextQuote size={16} aria-hidden="true" />
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
                    <label htmlFor="lorem-output" className="text-sm font-medium text-[var(--color-text)]">
                        Result
                    </label>
                    <span className="text-xs text-[var(--color-text-subtle)]">
                        {wordCount} {wordCount === 1 ? 'word' : 'words'}
                    </span>
                </div>
                <textarea
                    id="lorem-output"
                    className="min-h-64 w-full resize-y rounded-b-lg border-0 bg-[var(--color-input)] px-3 py-3 text-sm leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus-visible:outline-none"
                    value={output}
                    readOnly
                    aria-live="polite"
                    placeholder="Your placeholder text will appear here…"
                    spellCheck={false}
                />
            </div>
        </div>
    )
}
