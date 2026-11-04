export type DiffLine = {
    kind: 'same' | 'added' | 'removed'
    text: string
}

export function createLineDiff(before: string, after: string): DiffLine[] {
    const oldLines = before.split(/\r?\n/)
    const newLines = after.split(/\r?\n/)
    const width = newLines.length + 1
    const lengths = new Uint32Array((oldLines.length + 1) * width)

    for (let oldIndex = oldLines.length - 1; oldIndex >= 0; oldIndex -= 1) {
        for (let newIndex = newLines.length - 1; newIndex >= 0; newIndex -= 1) {
            const cell = oldIndex * width + newIndex
            lengths[cell] =
                oldLines[oldIndex] === newLines[newIndex]
                    ? lengths[(oldIndex + 1) * width + newIndex + 1] + 1
                    : Math.max(lengths[(oldIndex + 1) * width + newIndex], lengths[oldIndex * width + newIndex + 1])
        }
    }

    const diff: DiffLine[] = []
    let oldIndex = 0
    let newIndex = 0
    while (oldIndex < oldLines.length && newIndex < newLines.length) {
        if (oldLines[oldIndex] === newLines[newIndex]) {
            diff.push({ kind: 'same', text: oldLines[oldIndex] })
            oldIndex += 1
            newIndex += 1
        } else if (lengths[(oldIndex + 1) * width + newIndex] >= lengths[oldIndex * width + newIndex + 1]) {
            diff.push({ kind: 'removed', text: oldLines[oldIndex] })
            oldIndex += 1
        } else {
            diff.push({ kind: 'added', text: newLines[newIndex] })
            newIndex += 1
        }
    }

    while (oldIndex < oldLines.length) {
        diff.push({ kind: 'removed', text: oldLines[oldIndex] })
        oldIndex += 1
    }
    while (newIndex < newLines.length) {
        diff.push({ kind: 'added', text: newLines[newIndex] })
        newIndex += 1
    }

    return diff
}
