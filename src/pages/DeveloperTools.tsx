import { ArrowDownUp, Braces, Clock3, Fingerprint, Hash } from 'lucide-react'
import { ToolCard } from '../components/ToolCard'
import { tools } from '../lib/tools'

const ICONS: Record<string, React.ReactNode> = {
    'json-formatter': <Braces size={18} aria-hidden="true" />,
    'uuid-generator': <Fingerprint size={18} aria-hidden="true" />,
    'unix-timestamp-converter': <Clock3 size={18} aria-hidden="true" />,
    'text-json-diff': <ArrowDownUp size={18} aria-hidden="true" />,
    'sha256-hash-generator': <Hash size={18} aria-hidden="true" />,
}

export function DeveloperTools() {
    const developerTools = tools.filter((tool) => tool.category === 'developer')

    return (
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-4xl">
                Developer Tools
            </h1>
            <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">
                Handy utilities for JSON, timestamps, text comparisons, and hashes. Everything runs locally in your browser.
            </p>
            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {developerTools.map((tool) => (
                    <ToolCard
                        key={tool.slug}
                        icon={ICONS[tool.slug]}
                        name={tool.name}
                        description={tool.description}
                        to={tool.path}
                        category={tool.category}
                    />
                ))}
            </div>
        </div>
    )
}
