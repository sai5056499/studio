
'use server';

/**
 * @fileOverview A service for parsing semi-structured text from AI responses into structured data.
 */

interface ParsedSource {
    title: string;
    url: string;
    publication?: string;
}

/**
 * Parses a block of text where each line represents a source into an array of source objects.
 * This function is designed to be resilient to minor formatting errors from the AI.
 * 
 * @param {string} sourcesText - The text block containing sources, with each source on a new line.
 *                               Expected format per line: "Title | URL | Publication"
 * @returns {ParsedSource[]} - An array of parsed source objects.
 */
export function parseSources(sourcesText: string): ParsedSource[] {
    if (!sourcesText || typeof sourcesText !== 'string') {
        return [];
    }

    const lines = sourcesText.split('\n');
    const sources: ParsedSource[] = [];

    for (const line of lines) {
        if (!line.trim()) continue;

        const parts = line.split('|').map(part => part.trim());
        
        if (parts.length >= 2) {
            const title = parts[0] || "Untitled Source";
            let url = parts[1];
            const publication = parts[2] || undefined;
            
            // Basic URL validation/cleanup
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = `https://${url}`;
            }

            sources.push({
                title,
                url,
                publication,
            });
        }
    }

    return sources;
}
