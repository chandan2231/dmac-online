
/**
 * Calculates the Levenshtein distance between two strings.
 * This effectively counts the number of edits (insertions, deletions, substitutions)
 * needed to turn one string into the other.
 * 
 * @param {string} a 
 * @param {string} b 
 * @returns {number} The distance (integer)
 */
export const levenshteinDistance = (a, b) => {
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    if (an === 0) return bn;
    if (bn === 0) return an;

    const matrix = new Array(bn + 1);
    for (let i = 0; i <= bn; ++i) {
        let row = matrix[i] = new Array(an + 1);
        row[0] = i;
    }
    const firstRow = matrix[0];
    for (let j = 1; j <= an; ++j) {
        firstRow[j] = j;
    }
    for (let i = 1; i <= bn; ++i) {
        for (let j = 1; j <= an; ++j) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1], // substitution
                    matrix[i][j - 1],     // insertion
                    matrix[i - 1][j]      // deletion
                ) + 1;
            }
        }
    }
    return matrix[bn][an];
};

/**
 * Checks if two strings are a "fuzzy match" based on their length.
 * 
 * Rules:
 * - Length < 3: Must be exact match (e.g. "is" vs "in" -> No match)
 * - Length 3-5: Allow distance of 1 (e.g. "car" vs "care" -> Match)
 * - Length > 5: Allow distance of 2 (e.g. "elephant" vs "elefant" -> Match)
 * 
 * @param {string} input - User input word
 * @param {string} target - Target word (correct answer)
 * @returns {boolean}
 */
export const isFuzzyMatch = (input, target) => {
    if (!input || !target) return false;

    const normInput = input.trim().toLowerCase();
    const normTarget = target.trim().toLowerCase();

    // 1. Check exact match first (fastest)
    if (normInput === normTarget) return true;

    // 2. Check containment for small typos if lengths are significantly different? 
    // For now, rely on distance.

    const len = normTarget.length;
    const dist = levenshteinDistance(normInput, normTarget);

    if (len < 3) {
        return dist === 0;
    } else if (len <= 5) {
        return dist <= 1;
    } else {
        // Length > 5
        return dist <= 2;
    }
};
