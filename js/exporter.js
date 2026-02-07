/**
 * Export Module
 * Handles exporting problems in different formats
 */

class Exporter {
    /**
     * Export problems as CSV
     */
    exportAsCSV(problems) {
        const headers = ['Contest ID', 'Index', 'Name', 'Rating', 'Solved Count', 'Tags', 'URL'];
        const rows = problems.map(p => [
            p.contestId,
            p.index,
            `"${p.name.replace(/"/g, '""')}"`,
            p.rating || 'N/A',
            p.solvedCount,
            `"${p.tags.join(', ')}"`,
            `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        this.downloadFile(csv, 'codeforces_problems.csv', 'text/csv');
    }

    /**
     * Export problems as JSON
     */
    exportAsJSON(problems) {
        const data = problems.map(p => ({
            contestId: p.contestId,
            index: p.index,
            name: p.name,
            rating: p.rating || null,
            solvedCount: p.solvedCount,
            tags: p.tags,
            url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`
        }));

        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, 'codeforces_problems.json', 'application/json');
    }

    /**
     * Export problems for Vjudge
     * Format: CodeForces | 1A | 1 |
     */
    exportForVjudge(problems) {
        const lines = problems.map(p => 
            `CodeForces\t|\t${p.contestId}${p.index}\t|\t1\t|\t`
        );

        const text = lines.join('\n');
        this.downloadFile(text, 'vjudge_problems.txt', 'text/plain');
    }

    /**
     * Download file helper
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Copy to clipboard
     */
    copyToClipboard(text) {
        return navigator.clipboard.writeText(text);
    }
}

export default Exporter;
