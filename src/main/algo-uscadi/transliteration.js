const TransliterationMapping = require('./transliteration-mapping');

// Transliterates a word using the provided mapping
function transliterateWord(word, mapping=TransliterationMapping) {
        return Array.from(word).map((char) => {
            return mapping[char] ||  char
        }).join('')
}

module.exports = transliterateWord;