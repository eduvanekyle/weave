import { useEffect, useState } from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'
import { ToolPageHeader } from '../components/ToolPageHeader'

export function UnixTimestampConverter() {
    const [dateTimeInput, setDateTimeInput] = useState('')
    const [timestampInput, setTimestampInput] = useState('')
    const [unixResult, setUnixResult] = useState<{ local: string; utc: string } | null>(null)
    const [dateTimeResult, setDateTimeResult] = useState<{ seconds: string; milliseconds: number; zone: string } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000)
        return () => window.clearInterval(timer)
    }, [])

    const convertUnixToDate = () => {
        const value = Number(timestampInput.trim())
        if (!timestampInput.trim() || !Number.isFinite(value)) {
            setError('Enter a valid Unix timestamp in seconds or milliseconds.')
            setUnixResult(null)
            return
        }
        const milliseconds = Math.abs(value) >= 1e12 ? value : value * 1000
        const date = new Date(milliseconds)
        if (!Number.isFinite(date.getTime())) {
            setError('That timestamp is outside the supported date range.')
            setUnixResult(null)
            return
        }
        const localDate = date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
        })
        setUnixResult({
            local: `${localDate} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`,
            utc: date.toISOString(),
        })
        setError(null)
    }

    const convertDateToUnix = (zone: 'local' | 'utc') => {
        if (!dateTimeInput) {
            setError('Choose a date and time to convert.')
            setDateTimeResult(null)
            return
        }
        const date = new Date(zone === 'utc' ? `${dateTimeInput}Z` : dateTimeInput)
        if (!Number.isFinite(date.getTime())) {
            setError('Enter a valid date and time.')
            setDateTimeResult(null)
            return
        }
        setDateTimeResult({
            seconds: String(date.getTime() / 1000),
            milliseconds: date.getTime(),
            zone: zone === 'local' ? `Local (${Intl.DateTimeFormat().resolvedOptions().timeZone})` : 'UTC',
        })
        setError(null)
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <ToolPageHeader
                backTo="/developer-tools"
                backLabel="Back to Developer Tools"
                title="Unix Timestamp Converter"
                description="Convert Unix seconds or milliseconds to local time and UTC, or convert a date and time to Unix time."
            />

            <div className="mb-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
                    Current Unix timestamp
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[var(--color-text)]" aria-live="off">
                    {Math.floor(now / 1000)}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {new Date(now).toLocaleString()}
                </p>
            </div>

            <div className="flex flex-col gap-5">
                <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                        <ArrowRightLeft size={17} className="text-accent" aria-hidden="true" />
                        <h2 className="text-base font-semibold text-[var(--color-text)]">Timestamp to date</h2>
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        Enter Unix time in seconds or milliseconds.
                    </p>
                    <form
                        className="mt-4 flex flex-col gap-3 sm:flex-row"
                        onSubmit={(event) => {
                            event.preventDefault()
                            convertUnixToDate()
                        }}
                    >
                        <input
                            id="unix-input"
                            type="number"
                            className="min-w-0 flex-1 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-input)] px-3 py-2.5 font-mono text-sm text-[var(--color-text)]"
                            value={timestampInput}
                            onChange={(event) => setTimestampInput(event.target.value)}
                            placeholder="e.g. 1735689600"
                            aria-label="Unix timestamp in seconds or milliseconds"
                        />
                        <PrimaryButton type="submit">Convert timestamp</PrimaryButton>
                    </form>
                    {unixResult && (
                        <dl className="mt-5 grid gap-3 rounded-lg bg-[var(--color-bg)] p-4 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="font-medium text-[var(--color-text)]">Your local time</dt>
                                <dd className="mt-1 break-words text-[var(--color-text-muted)]">{unixResult.local}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-[var(--color-text)]">UTC</dt>
                                <dd className="mt-1 break-words font-mono text-[var(--color-text-muted)]">{unixResult.utc}</dd>
                            </div>
                        </dl>
                    )}
                </section>

                <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                        <ArrowRightLeft size={17} className="text-accent" aria-hidden="true" />
                        <h2 className="text-base font-semibold text-[var(--color-text)]">Date to timestamp</h2>
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        Select a date and time, including seconds, then choose its timezone.
                    </p>
                    <label htmlFor="datetime-input" className="mb-2 mt-4 block text-sm font-medium text-[var(--color-text)]">
                        Date and time
                    </label>
                    <input
                        id="datetime-input"
                        type="datetime-local"
                        step="1"
                        className="w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-input)] px-3 py-2.5 text-sm text-[var(--color-text)]"
                        value={dateTimeInput}
                        onChange={(event) => setDateTimeInput(event.target.value)}
                    />
                    <div className="mt-3 flex flex-wrap gap-3">
                        <PrimaryButton onClick={() => convertDateToUnix('local')}>Convert as local time</PrimaryButton>
                        <SecondaryButton onClick={() => convertDateToUnix('utc')}>Convert as UTC</SecondaryButton>
                    </div>
                    {dateTimeResult && (
                        <dl className="mt-5 grid gap-3 rounded-lg bg-[var(--color-bg)] p-4 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="font-medium text-[var(--color-text)]">Unix timestamp (seconds, {dateTimeResult.zone})</dt>
                                <dd className="mt-1 break-all font-mono text-lg font-semibold text-[var(--color-text)]">
                                    {dateTimeResult.seconds}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-medium text-[var(--color-text)]">Unix timestamp (milliseconds)</dt>
                                <dd className="mt-1 break-all font-mono text-[var(--color-text-muted)]">
                                    {dateTimeResult.milliseconds}
                                </dd>
                            </div>
                        </dl>
                    )}
                </section>
            </div>
            {error && <p className="mt-4 text-sm text-danger" role="alert">{error}</p>}
        </div>
    )
}
