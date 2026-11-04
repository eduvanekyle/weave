import { useEffect, useState } from 'react'
import { Download, QrCode, Trash2 } from 'lucide-react'
import QRCode from 'qrcode'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'
import { ToolPageHeader } from '../components/ToolPageHeader'

type Level = 'L' | 'M' | 'Q' | 'H'

const LEVELS: { value: Level; label: string }[] = [
    { value: 'L', label: 'Low (7%)' },
    { value: 'M', label: 'Medium (15%)' },
    { value: 'Q', label: 'Quartile (25%)' },
    { value: 'H', label: 'High (30%)' },
]

const MAX_LENGTH = 1000
const INPUT_CLASS =
    'w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-text)]'

export function QrCodeGenerator() {
    const [text, setText] = useState('')
    const [level, setLevel] = useState<Level>('M')
    const [size, setSize] = useState(320)
    const [dataUrl, setDataUrl] = useState('')
    const [error, setError] = useState<string | null>(null)

    const trimmed = text.trim()

    // The QR code is always rendered in black on white so it stays scannable in dark mode.
    useEffect(() => {
        if (!trimmed) return
        let cancelled = false
        QRCode.toDataURL(trimmed, {
            errorCorrectionLevel: level,
            width: size,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
        })
            .then((url) => {
                if (cancelled) return
                setDataUrl(url)
                setError(null)
            })
            .catch((cause: unknown) => {
                if (cancelled) return
                setDataUrl('')
                setError(cause instanceof Error ? cause.message : 'Unable to generate a QR code.')
            })
        return () => {
            cancelled = true
        }
    }, [trimmed, level, size])

    const visibleUrl = trimmed ? dataUrl : ''
    const visibleError = trimmed ? error : null

    const download = () => {
        const link = document.createElement('a')
        link.href = visibleUrl
        link.download = 'qr-code.png'
        link.click()
    }

    const clear = () => {
        setText('')
        setDataUrl('')
        setError(null)
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/developer-tools"
                backLabel="Back to Developer Tools"
                title="QR Code Generator"
                description="Turn text or a link into a QR code you can download as a PNG. Nothing is uploaded."
            />

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="flex flex-col gap-4">
                    <div className="overflow-hidden rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-input)] focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
                        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-hover)] px-3 py-2">
                            <label htmlFor="qr-input" className="text-sm font-medium text-[var(--color-text)]">
                                Text or URL
                            </label>
                            <span className="text-xs text-[var(--color-text-subtle)]">
                                {text.length} / {MAX_LENGTH}
                            </span>
                        </div>
                        <textarea
                            id="qr-input"
                            className="min-h-40 w-full resize-y rounded-b-lg border-0 bg-[var(--color-input)] px-3 py-3 font-mono text-sm leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus-visible:outline-none"
                            value={text}
                            maxLength={MAX_LENGTH}
                            onChange={(event) => setText(event.target.value)}
                            placeholder="https://example.com"
                            spellCheck={false}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="qr-level" className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                                Error correction
                            </label>
                            <select
                                id="qr-level"
                                className={INPUT_CLASS}
                                value={level}
                                onChange={(event) => setLevel(event.target.value as Level)}
                            >
                                {LEVELS.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label htmlFor="qr-size" className="text-sm font-medium text-[var(--color-text)]">
                                    Size
                                </label>
                                <span className="text-sm tabular-nums text-[var(--color-text-muted)]">{size}px</span>
                            </div>
                            <input
                                id="qr-size"
                                type="range"
                                min={128}
                                max={1024}
                                step={32}
                                value={size}
                                onChange={(event) => setSize(Number(event.target.value))}
                                className="w-full accent-[var(--color-accent)]"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <PrimaryButton onClick={download} disabled={!visibleUrl}>
                            <Download size={16} aria-hidden="true" />
                            Download PNG
                        </PrimaryButton>
                        <SecondaryButton onClick={clear}>
                            <Trash2 size={16} aria-hidden="true" />
                            Clear
                        </SecondaryButton>
                    </div>

                    {visibleError && (
                        <p
                            className="rounded-lg border border-red-500/30 bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-danger"
                            role="alert"
                        >
                            {visibleError}
                        </p>
                    )}
                </div>

                <div className="overflow-hidden rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)]">
                    <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-hover)] px-3 py-2">
                        <h2 className="text-sm font-medium text-[var(--color-text)]">Preview</h2>
                        <span className="text-xs text-[var(--color-text-subtle)]">
                            {visibleUrl ? `${size} × ${size}px` : 'No code yet'}
                        </span>
                    </div>
                    <div className="flex min-h-72 items-center justify-center p-4">
                        {visibleUrl ? (
                            <img
                                src={visibleUrl}
                                alt="Generated QR code"
                                className="h-auto max-w-full rounded-md border border-[var(--color-border)]"
                                style={{ width: size }}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-center text-sm text-[var(--color-text-subtle)]">
                                <QrCode size={40} aria-hidden="true" />
                                Enter some text to see your QR code.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
