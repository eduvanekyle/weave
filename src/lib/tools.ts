export interface ToolMeta {
    slug: string
    name: string
    description: string
    category: 'image' | 'pdf' | 'excel' | 'developer'
    path: string
}

export const tools: ToolMeta[] = [
    {
        slug: 'image-converter',
        name: 'Image Converter',
        description: 'Convert PNG, JPG, and WebP images.',
        category: 'image',
        path: '/image-tools/converter',
    },
    {
        slug: 'image-compressor',
        name: 'Image Compressor',
        description: 'Reduce image file size while controlling quality.',
        category: 'image',
        path: '/image-tools/compressor',
    },
    {
        slug: 'merge-pdf',
        name: 'Merge PDF',
        description: 'Combine multiple PDF files into one document.',
        category: 'pdf',
        path: '/pdf-tools/merge',
    },
    {
        slug: 'pdf-compressor',
        name: 'PDF Compressor',
        description: 'Reduce PDF file size while preserving document content.',
        category: 'pdf',
        path: '/pdf-tools/compressor',
    },
    {
        slug: 'pdf-to-image',
        name: 'PDF to Image',
        description: 'Convert PDF pages into JPG or PNG images.',
        category: 'pdf',
        path: '/pdf-tools/to-image',
    },
    {
        slug: 'split-pdf',
        name: 'Split PDF',
        description: 'Extract page ranges or split every page into its own file.',
        category: 'pdf',
        path: '/pdf-tools/split',
    },
    {
        slug: 'sign-pdf',
        name: 'Sign PDF',
        description: 'Place a signature image onto a PDF page.',
        category: 'pdf',
        path: '/pdf-tools/sign',
    },
    {
        slug: 'excel-converter',
        name: 'Excel Converter',
        description: 'Convert spreadsheets to XLSX, XLS, CSV, or JSON.',
        category: 'excel',
        path: '/excel-tools/converter',
    },
    {
        slug: 'merge-excel',
        name: 'Merge Excel',
        description: 'Combine multiple spreadsheets into one file.',
        category: 'excel',
        path: '/excel-tools/merge',
    },
    {
        slug: 'smart-merge-excel',
        name: 'Smart Merge Excel',
        description: 'Merge spreadsheets with different or reordered headers.',
        category: 'excel',
        path: '/excel-tools/smart-merge',
    },
    {
        slug: 'split-excel',
        name: 'Split Excel',
        description: 'Turn every sheet in a workbook into its own file.',
        category: 'excel',
        path: '/excel-tools/split',
    },
    {
        slug: 'unpivot-excel',
        name: 'Unpivot Excel',
        description: 'Turn columns into attribute and value rows.',
        category: 'excel',
        path: '/excel-tools/unpivot',
    },
    {
        slug: 'json-to-csv',
        name: 'JSON to CSV',
        description: 'Convert JSON records into a CSV file.',
        category: 'excel',
        path: '/excel-tools/json-to-csv',
    },
    {
        slug: 'json-formatter',
        name: 'JSON Formatter & Validator',
        description: 'Format JSON and check it for syntax errors.',
        category: 'developer',
        path: '/developer-tools/json-formatter',
    },
    {
        slug: 'uuid-generator',
        name: 'UUID Generator',
        description: 'Generate a random UUID in your browser.',
        category: 'developer',
        path: '/developer-tools/uuid-generator',
    },
    {
        slug: 'unix-timestamp-converter',
        name: 'Unix Timestamp Converter',
        description: 'Convert between Unix time, local time, and UTC.',
        category: 'developer',
        path: '/developer-tools/unix-timestamp-converter',
    },
    {
        slug: 'text-json-diff',
        name: 'Text / JSON Diff',
        description: 'Compare two text or JSON snippets line by line.',
        category: 'developer',
        path: '/developer-tools/text-json-diff',
    },
    {
        slug: 'sha256-hash-generator',
        name: 'SHA-256 Hash Generator',
        description: 'Create a SHA-256 hash from text locally.',
        category: 'developer',
        path: '/developer-tools/sha256-hash-generator',
    },
    {
        slug: 'password-generator',
        name: 'Password / Random String Generator',
        description: 'Generate secure random passwords and strings.',
        category: 'developer',
        path: '/developer-tools/password-generator',
    },
    {
        slug: 'lorem-ipsum-generator',
        name: 'Lorem Ipsum Generator',
        description: 'Generate placeholder paragraphs, sentences, or words.',
        category: 'developer',
        path: '/developer-tools/lorem-ipsum-generator',
    },
    {
        slug: 'qr-code-generator',
        name: 'QR Code Generator',
        description: 'Turn text or a link into a downloadable QR code.',
        category: 'developer',
        path: '/developer-tools/qr-code-generator',
    },
]
