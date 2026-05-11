// 「ァ-ヶ」(カタカナ全角) の char code に 0x60 を引くと対応するひらがなになる仕様を使う。
const KATAKANA_TO_HIRAGANA_OFFSET = 0x60;
const KATAKANA_RANGE = /[ァ-ヶ]/g;

/**
 * 日本語検索向けに文字列を正規化する。
 *
 * - カタカナ → ひらがな に揃える
 * - 大文字英字 → 小文字
 *
 * これにより「USB」「ｕｓｂ」「うｓｂ」「ウｓｂ」がすべて同一の検索キーになる。
 */
export function normalizeJapaneseSearchTerm(value: string): string {
  return value
    .replace(KATAKANA_RANGE, (character) =>
      String.fromCharCode(
        character.charCodeAt(0) - KATAKANA_TO_HIRAGANA_OFFSET,
      ),
    )
    .toLowerCase();
}
