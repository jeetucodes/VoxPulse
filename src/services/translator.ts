// Speech Transcript Translation Service (English <-> Hindi & Multi-language)
import type { TranscriptWord } from '../types/speech';

export interface TranslationResult {
  translatedWords: TranscriptWord[];
  fullSentenceTranslation: string;
  sourceLang: 'en' | 'hi';
  targetLang: 'en' | 'hi';
}

export class TranslatorService {
  /**
   * Detects if the text is primarily Hindi (Devanagari script) or English
   */
  public static isHindiText(text: string): boolean {
    const hindiCharRegex = /[\u0900-\u097F]/;
    return hindiCharRegex.test(text);
  }

  /**
   * Translates a complete text paragraph/speech using high-quality Google neural translation
   */
  public static async translateText(
    text: string, 
    sourceLang: 'en' | 'hi' = 'en', 
    targetLang: 'en' | 'hi' = 'hi'
  ): Promise<string> {
    if (!text || !text.trim()) return '';
    if (sourceLang === targetLang) return text;

    // 1. Try local Vite dev proxy if running in browser
    try {
      const proxyUrl = `/api/translate?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text.trim())}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const resp = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data[0])) {
          const translatedChunks = data[0].map((item: any) => item[0]).filter(Boolean);
          const fullTranslation = translatedChunks.join('').trim();
          if (fullTranslation.length > 0) {
            return fullTranslation;
          }
        }
      }
    } catch {
      // proxy failed or not in dev server, try direct
    }

    // 2. Direct Google Translate GTX endpoint
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text.trim())}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data[0])) {
          const translatedChunks = data[0].map((item: any) => item[0]).filter(Boolean);
          const fullTranslation = translatedChunks.join('').trim();
          if (fullTranslation.length > 0) {
            return fullTranslation;
          }
        }
      }
    } catch {
      // If primary engine times out or has CORS, attempt secondary fallback
    }

    // Secondary fallback via MyMemory
    try {
      const langPair = `${sourceLang}|${targetLang}`;
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=${langPair}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const resText = data?.responseData?.translatedText;
        if (resText && !resText.includes('MYMEMORY WARNING')) {
          return resText.trim();
        }
      }
    } catch {
      // ignore
    }

    return this.fallbackTranslate(text, targetLang);
  }

  /**
   * Translates TranscriptWords into fluent, grammatically accurate translated words
   * while keeping millisecond flaw tags and pause positions grounded!
   */
  public static async translateTranscriptWords(
    words: TranscriptWord[],
    targetLang: 'en' | 'hi'
  ): Promise<TranslationResult> {
    if (words.length === 0) {
      return {
        translatedWords: [],
        fullSentenceTranslation: '',
        sourceLang: 'en',
        targetLang
      };
    }

    const fullSentence = words.map(w => w.word).join(' ');
    const sourceLang: 'en' | 'hi' = this.isHindiText(fullSentence) ? 'hi' : 'en';

    if (sourceLang === targetLang) {
      return {
        translatedWords: words,
        fullSentenceTranslation: fullSentence,
        sourceLang,
        targetLang
      };
    }

    // High quality neural translation
    const fullSentenceTranslation = await this.translateText(fullSentence, sourceLang, targetLang);
    const translatedTokens = fullSentenceTranslation.split(/\s+/).filter(Boolean);

    if (translatedTokens.length === 0) {
      return {
        translatedWords: words,
        fullSentenceTranslation,
        sourceLang,
        targetLang
      };
    }

    // Distribute translated tokens onto original temporal slots
    const totalOriginal = words.length;
    const totalTranslated = translatedTokens.length;

    const translatedWords: TranscriptWord[] = translatedTokens.map((token, index) => {
      const origIndex = Math.min(totalOriginal - 1, Math.floor((index / totalTranslated) * totalOriginal));
      const origWord = words[origIndex];

      const start = origWord ? origWord.start : (index / totalTranslated) * 15;
      const end = origWord ? origWord.end : ((index + 1) / totalTranslated) * 15;

      return {
        id: `trans-${index}-${origWord?.id || index}`,
        word: token,
        start,
        end,
        flawType: origWord?.flawType,
        flawId: origWord?.flawId,
        flawExplanation: origWord?.flawExplanation,
        measuredMetric: origWord?.measuredMetric,
        isPauseAdjacent: origWord?.isPauseAdjacent,
        pauseDuration: origWord?.pauseDuration,
        pauseStart: origWord?.pauseStart,
        originalWord: origWord?.word,
      };
    });

    return {
      translatedWords,
      fullSentenceTranslation,
      sourceLang,
      targetLang
    };
  }

  /**
   * Local translation fallback dictionary for competition speeches
   */
  private static fallbackTranslate(text: string, targetLang: 'en' | 'hi'): string {
    const enToHi: Record<string, string> = {
      'judges': 'माननीय निर्णायकगण',
      'judge': 'निर्णायक',
      'and': 'और',
      'audience': 'श्रोतागण',
      'let': 'आइए',
      'us': 'हम',
      'examine': 'परीक्षण करें',
      'the': '',
      'compelling': 'अकाट्य',
      'evidence': 'साक्ष्य',
      'before': 'समक्ष',
      'today': 'आज',
      'when': 'जब',
      'we': 'हम',
      'analyze': 'विश्लेषण करते हैं',
      'historical': 'ऐतिहासिक',
      'civic': 'नागरिक',
      'progress': 'प्रगति का',
      'realize': 'समझते हैं',
      'that': 'कि',
      'transformative': 'परिवर्तनकारी',
      'breakthroughs': 'उपलब्धियां',
      'do': 'नहीं',
      'not': 'नहीं',
      'arise': 'आतीं',
      'by': 'संयोग से',
      'chance': 'संयोग',
      'they': 'वे',
      'require': 'मांग करती हैं',
      'decisive': 'दृढ़',
      'leadership': 'नेतृत्व',
      'resilience': 'धैर्य',
      'unshakeable': 'अडिग',
      'conviction': 'विश्वास',
      'however': 'हालाँकि',
      'delivery': 'भाषण प्रस्तुति',
      'accelerates': 'तेज़ होती है',
      'excessively': 'अत्यधिक',
      'or': 'या',
      'hesitates': 'हिचकिचाती है',
      'into': 'में',
      'prolonged': 'लंबे',
      'silences': 'मौन',
      'clarity': 'स्पष्टता',
      'of': 'का',
      'core': 'मूल',
      'message': 'संदेश',
      'dissolves': 'खो जाता है',
      'speech': 'भाषण',
      'good': 'शुभ',
      'morning': 'प्रभात',
      'everyone': 'सभी को',
      'thank': 'धन्यवाद',
      'you': 'आप',
      'hello': 'नमस्ते'
    };

    const hiToEn: Record<string, string> = {
      'नमस्ते': 'Hello',
      'धन्यवाद': 'Thank you',
      'भाषण': 'Speech',
      'निर्णायकगण': 'Honorable Judges',
      'श्रोतागण': 'Audience',
      'आज': 'Today',
      'प्रगति': 'Progress',
      'नेतृत्व': 'Leadership',
      'स्पष्टता': 'Clarity',
      'संदेश': 'Message'
    };

    const dict = targetLang === 'hi' ? enToHi : hiToEn;
    const words = text.split(/\s+/);

    const translated = words.map(w => {
      const clean = w.toLowerCase().replace(/[^\w\u0900-\u097F]/g, '');
      if (dict[clean]) {
        return dict[clean];
      }
      return w;
    });

    return translated.filter(Boolean).join(' ');
  }
}
