/**
 * Normalize Vietnamese text for keyword matching.
 * Lowercases, replaces đ→d before NFD decomposition (U+0111 does not decompose via NFD),
 * strips combining diacritics (U+0300–U+036F), collapses whitespace.
 * @param {string} text
 * @returns {string}
 */
export const normalizeText = (text) =>
  text
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
