const VOWELS = ['A', 'E', 'I', 'O', 'U', 'Y'];
const SILENT_STARTERS = ["GN", "KN", "PN", "WR", "PS"];

class DoubleMetaphoneProcessor {
    constructor(position) {
        this.position = position;
        this.primary_phone = "";
        this.secondary_phone = "";
        this.next = [null, 1];
    }

    checkWordStart(word) {
        if (SILENT_STARTERS.includes(word.substring(0, 2))) {
            this.position += 1;
        }
        if (word[0] === 'X') {
            this.primary_phone = this.secondary_phone = 'S';
            this.position += 1;
        }
    }

    processInitialVowels(word) {
        this.next = [null, 1];
        if (this.position === 0) {
            this.next = ['A', 1];
        }
    }

    processB(word) {
        if (word[this.position + 1] === 'B') {
            this.next = ['P', 2];
        } else {
            this.next = ['P', 1];
        }
    }

    processC(word) {
        const buffer = word;
        const position = this.position;
        const start_index = 0;

        if (position > start_index + 1 && !VOWELS.includes(buffer[position - 2]) && buffer.substring(position - 1, position + 2) === 'ACH' && buffer[position + 2] !== 'I' && (buffer[position + 2] !== 'E' || ['BACHER', 'MACHER'].includes(buffer.substring(position - 2, position + 4)))) {
            this.next = ['K', 2];
        } else if (position === start_index && buffer.substring(start_index, start_index + 6) === 'CAESAR') {
            this.next = ['S', 2];
        } else if (buffer.substring(position, position + 4) === 'CHIA') {
            this.next = ['K', 2];
        } else if (buffer.substring(position, position + 2) === 'CH') {
            if (position > start_index && buffer.substring(position, position + 4) === 'CHAE') {
                this.next = ['K', 'X', 2];
            } else if (position === start_index && ['HARAC', 'HARIS'].includes(buffer.substring(position + 1, position + 6)) || ['HOR', 'HYM', 'HIA', 'HEM'].includes(buffer.substring(position + 1, position + 4)) && buffer.substring(start_index, start_index + 5) !== 'CHORE') {
                this.next = ['K', 2];
            } else if (['VAN ', 'VON '].includes(buffer.substring(start_index, start_index + 4)) || buffer.substring(start_index, start_index + 3) === 'SCH' || ['ORCHES', 'ARCHIT', 'ORCHID'].includes(buffer.substring(position - 2, position + 4)) || ['T', 'S'].includes(buffer[position + 2]) || ((['A', 'O', 'U', 'E'].includes(buffer[position - 1]) || position === start_index) && ['L', 'R', 'N', 'M', 'B', 'H', 'F', 'V', 'W', ' '].includes(buffer[position + 2]))) {
                this.next = ['K', 2];
            } else {
                if (position > start_index) {
                    if (buffer.substring(start_index, start_index + 2) === 'MC') {
                        this.next = ['K', 2];
                    } else {
                        this.next = ['X', 'K', 2];
                    }
                } else {
                    this.next = ['X', 2];
                }
            }
        } else if (buffer.substring(position, position + 2) === 'CZ' && buffer.substring(position - 2, position + 2) !== 'WICZ') {
            this.next = ['S', 'X', 2];
        } else if (buffer.substring(position + 1, position + 4) === 'CIA') {
            this.next = ['X', 3];
        } else if (buffer.substring(position, position + 2) === 'CC' && !(position === (start_index + 1) && buffer[start_index] === 'M')) {
            if (['I', 'E', 'H'].includes(buffer[position + 2]) && buffer.substring(position + 2, position + 4) !== 'HU') {
                if ((position === (start_index + 1) && buffer[start_index] === 'A') || ['UCCEE', 'UCCES'].includes(buffer.substring(position - 1, position + 4))) {
                    this.next = ['KS', 3];
                } else {
                    this.next = ['X', 3];
                }
            } else {
                this.next = ['K', 2];
            }
        } else if (['CK', 'CG', 'CQ'].includes(buffer.substring(position, position + 2))) {
            this.next = ['K', 2];
        } else if (['CI', 'CE', 'CY'].includes(buffer.substring(position, position + 2))) {
            if (['CIO', 'CIE', 'CIA'].includes(buffer.substring(position, position + 3))) {
                this.next = ['S', 'X', 2];
            } else {
                this.next = ['S', 2];
            }
        } else {
            if ([' C', ' Q', ' G'].includes(buffer.substring(position + 1, position + 3))) {
                this.next = ['K', 3];
            } else {
                if (['C', 'K', 'Q'].includes(buffer[position + 1]) && !['CE', 'CI'].includes(buffer.substring(position + 1, position + 3))) {
                    this.next = ['K', 2];
                } else {
                    this.next = ['K', 1];
                }
            }
        }
    }

    processD(word) {
        if (word.substring(this.position, this.position + 2) === 'DG') {
            if (['I', 'E', 'Y'].includes(word[this.position + 2])) {
                this.next = ['J', 3];
            } else {
                this.next = ['TK', 2];
            }
        } else if (['DT', 'DD'].includes(word.substring(this.position, this.position + 2))) {
            this.next = ['T', 2];
        } else {
            this.next = ['T', 1];
        }
    }

    processF(word) {
        if (word[this.position + 1] === 'F') {
            this.next = ['F', 2];
        } else {
            this.next = ['F', 1];
        }
    }

    processG(word) {
        const buffer = word;
        const position = this.position;
        const start_index = 0;

        if (buffer[position + 1] === 'H') {
            if (position > start_index && !VOWELS.includes(buffer[position - 1])) {
                this.next = ['K', 2];
            } else if (position < (start_index + 3)) {
                if (position === start_index) {
                    if (buffer[position + 2] === 'I') {
                        this.next = ['J', 2];
                    } else {
                        this.next = ['K', 2];
                    }
                }
            } else if ((position > (start_index + 1) && ['B', 'H', 'D'].includes(buffer[position - 2])) || (position > (start_index + 2) && ['B', 'H', 'D'].includes(buffer[position - 3])) || (position > (start_index + 3) && ['B', 'H'].includes(buffer[position - 4]))) {
                this.next = [null, 2];
            } else {
                if (position > (start_index + 2) && buffer[position - 1] === 'U' && ['C', 'G', 'L', 'R', 'T'].includes(buffer[position - 3])) {
                    this.next = ['F', 2];
                } else {
                    if (position > start_index && buffer[position - 1] !== 'I') {
                        this.next = ['K', 2];
                    }
                }
            }
        } else if (buffer[position + 1] === 'N') {
            if (position === (start_index + 1) && VOWELS.includes(buffer[start_index]) && !this.isSlavoGermanic(word)) {
                this.next = ['KN', 'N', 2];
            } else {
                if (buffer.substring(position + 2, position + 4) !== 'EY' && buffer[position + 1] !== 'Y' && !this.isSlavoGermanic(word)) {
                    this.next = ['N', 'KN', 2];
                } else {
                    this.next = ['KN', 2];
                }
            }
        } else if (buffer.substring(position + 1, position + 3) === 'LI' && !this.isSlavoGermanic(word)) {
            this.next = ['KL', 'L', 2];
        } else if (position === start_index && (buffer[position + 1] === 'Y' || ['ES', 'EP', 'EB', 'EL', 'EY', 'IB', 'IL', 'IN', 'IE', 'EI', 'ER'].includes(buffer.substring(position + 1, position + 3)))) {
            this.next = ['K', 'J', 2];
        } else if ((buffer.substring(position + 1, position + 2) === 'ER' || buffer.substring(position + 1, position + 2) === 'Y') && (buffer.substring(start_index, start_index + 6) !== 'DANGER' && buffer.substring(start_index, start_index + 6) !== 'RANGER' && buffer.substring(start_index, start_index + 6) !== 'MANGER') && (buffer.substring(position - 1, position + 3) !== 'E') && (buffer.substring(position - 1, position + 3) !== 'I') && (buffer.substring(position - 1, position + 3) !== 'R') && (buffer.substring(position - 1, position + 3) !== 'Z')) {
            this.next = ['K', 'J', 2];
        } else if (buffer[position + 1] === 'E' || buffer[position + 1] === 'I' || buffer[position + 1] === 'Y' || buffer.substring(position - 1, position + 3) === 'AGGI' || buffer.substring(position - 1, position + 3) === 'OGGI') {
            if ((buffer.substring(start_index, start_index + 4) === 'VAN ' || buffer.substring(start_index, start_index + 3) === 'VON ') || buffer.substring(start_index, start_index + 3) === 'SCH' || (buffer[position + 1] === 'ET')) {
                this.next = ['K', 2];
            } else if (buffer.substring(position + 1, position + 3) === 'IER') {
                this.next = ['J', 2];
            } else {
                this.next = ['J', 'K', 2];
            }
        } else if (buffer[position + 1] === 'G') {
            this.next = ['K', 2];
        } else {
            this.next = ['K', 1];
        }
    }

    processH(word) {
        if ((this.position === 0 || VOWELS.includes(word[this.position - 1])) && VOWELS.includes(word[this.position + 1])) {
            this.next = ['H', 2];
        } else {
            this.next = [null, 1];
        }
    }

    processJ(word) {
        if (word.substring(this.position, this.position + 4) === 'JOSE' || word.substring(this.position, this.position + 4) === 'SAN ') {
            if ((this.position === 0 && word[this.position + 4] === ' ') || word.substring(0, 4) === 'SAN ') {
                this.next = ['H', 1];
            } else {
                this.next = ['J', 'H', 1];
            }
        } else {
            if (this.position === 0 && word.substring(this.position, this.position + 4) !== 'JOSE') {
                this.next = ['J', 'A', 1];
            } else {
                if (VOWELS.includes(word[this.position - 1]) && !this.isSlavoGermanic(word) && (word[this.position + 1] === 'A' || word[this.position + 1] === 'O')) {
                    this.next = ['J', 'H', 1];
                } else {
                    if (this.position === (word.length - 1)) {
                        this.next = ['J', ' ', 1];
                    } else {
                        if (!['L', 'T', 'K', 'S', 'N', 'M', 'B', 'Z'].includes(word[this.position + 1]) && !['S', 'K', 'L'].includes(word[this.position - 1])) {
                            this.next = ['J', 1];
                        } else {
                            this.next = [null, 1];
                        }
                    }
                }
            }
        }
        if (word[this.position + 1] === 'J') {
            this.next[1] += 1;
        }
    }

    processK(word) {
        if (word[this.position + 1] === 'K') {
            this.next = ['K', 2];
        } else {
            this.next = ['K', 1];
        }
    }

    processL(word) {
        if (word[this.position + 1] === 'L') {
            if ((this.position === (word.length - 3) && word.substring(this.position - 1, this.position + 3) === 'ILLO') || ((word.substring(this.position - 1, this.position + 4) === 'ILLO') || (word.substring(this.position - 1, this.position + 4) === 'ILLA') || (word.substring(this.position - 1, this.position + 4) === 'ALLE'))) {
                this.next = ['L', ' ', 2];
            } else {
                this.next = ['L', 2];
            }
        } else {
            this.next = ['L', 1];
        }
    }

    processM(word) {
        // buffer = self.word.buffer
        // position = self.position
        // if ((buffer[position + 1:position + 4] == 'UMB'
        //      and (position + 1 == self.word.end_index
        //           or buffer[position + 2:position + 4] == 'ER'))
        //     or buffer[position + 1] == 'M'):
        //     self.next = ('M', 2)
        // else:
        //     self.next = ('M', 1)
        const buffer = word;
        const position = this.position;

        if (((buffer.substring(position + 1, position + 4) === 'UMB') &&
                ((position == word.length - 1)
                    || (buffer.substring(position + 2, position + 4) === 'ER')))
            || buffer[position + 1] === 'M'
            )
        {
            this.next = ['M', 2];
        } else {
            this.next = ['M', 1];
        }
    }

    processN(word) {
        if (word[this.position + 1] === 'N') {
            this.next = ['N', 2];
        } else {
            this.next = ['N', 1];
        }
    }

    processP(word) {
        if (word[this.position + 1] === 'H') {
            this.next = ['F', 2];
        } else if (['P', 'B'].includes(word[this.position + 1])) {
            this.next = ['P', 2];
        } else {
            this.next = ['P', 1];
        }
    }

    processQ(word) {
        if (word[this.position + 1] === 'Q') {
            this.next = ['K', 2];
        } else {
            this.next = ['K', 1];
        }
    }

    processR(word) {
        if (this.position === (word.length - 1) && !this.isSlavoGermanic(word) && word.substring(this.position - 2, this.position) === 'IE' && !['ME', 'MA'].includes(word.substring(0, 2))) {
            this.next = ['R', ' ', 1];
        } else {
            this.next = ['R', 1];
        }
        if (word[this.position + 1] === 'R') {
            this.next[1] += 1;
        }
    }

    processS(word) {
        const buffer = word;
        const position = this.position;

        if (buffer.substring(position - 1, position + 2) === 'ISL' || buffer.substring(position - 1, position + 2) === 'YSL') {
            this.next = [null, 1];
        } else if (position === 0 && buffer.substring(position, position + 5) === 'SUGAR') {
            this.next = ['X', 'S', 1];
        } else if (buffer.substring(position, position + 2) === 'SH') {
            if (['HEIM', 'HOEK', 'HOLM', 'HOLZ'].includes(buffer.substring(position + 1, position + 5))) {
                this.next = ['S', 2];
            } else {
                this.next = ['X', 2];
            }
        } else if ((buffer.substring(position, position + 3) === 'SIO' || buffer.substring(position, position + 3) === 'SIA') || (buffer.substring(position, position + 4) === 'SIAN')) {
            if (this.isSlavoGermanic(word)) {
                this.next = ['S', 3];
            } else {
                this.next = ['S', 'X', 3];
            }
        } else if ((position === 0 && buffer.substring(position + 1, position + 3) === 'M') || buffer.substring(position + 1, position + 3) === 'N' || buffer.substring(position + 1, position + 3) === 'L' || buffer.substring(position + 1, position + 3) === 'W') {
            this.next = ['S', 'X', 1];
        } else if (buffer.substring(position, position + 2) === 'SC') {
            if (buffer[position + 2] === 'H') {
                if (buffer.substring(position + 3, position + 5) === 'OO' || buffer.substring(position + 3, position + 4) === 'ER' || buffer.substring(position + 3, position + 4) === 'EN' || buffer.substring(position + 3, position + 5) === 'UY' || buffer.substring(position + 3, position + 4) === 'ED' || buffer.substring(position + 3, position + 4) === 'EM') {
                    if (buffer.substring(position + 3, position + 5) === 'ER' || buffer.substring(position + 3, position + 5) === 'EN') {
                        this.next = ['X', 'SK', 3];
                    } else {
                        this.next = ['SK', 3];
                    }
                } else {
                    if ((position === 0 && !VOWELS.includes(buffer[3])) && buffer.substring(position + 3, position + 5) !== 'WH') {
                        this.next = ['S', 'K', 3];
                    } else {
                        this.next = ['X', 3];
                    }
                }
            } else if (['I', 'E', 'Y'].includes(buffer[position + 2])) {
                this.next = ['S', 3];
            } else {
                this.next = ['SK', 3];
            }
        } else if (position === (word.length - 1) && (buffer.substring(position - 2, position) === 'AI' || buffer.substring(position - 2, position) === 'OI')) {
            this.next = ['S', ' ', 1];
        } else if (buffer.substring(position, position + 2) === 'ST' && buffer.substring(position + 2, position + 3) === 'L' && buffer.substring(position + 2, position + 3) === 'R' && buffer.substring(position + 2, position + 3) === 'Z') {
            this.next = ['S', 2];
        } else {
            this.next = ['S', 1];
        }
    }

    processT(word) {
        const buffer = word;
        const position = this.position;

        if (buffer.substring(position, position + 4) === 'TION') {
            this.next = ['X', 3];
        } else if (buffer.substring(position, position + 3) === 'TIA' || buffer.substring(position, position + 3) === 'TCH') {
            this.next = ['X', 3];
        } else if (buffer.substring(position, position + 2) === 'TH' || buffer.substring(position, position + 3) === 'TTH') {
            if (buffer.substring(position + 2, position + 4) === 'OM' || buffer.substring(position + 2, position + 4) === 'AM') {
                this.next = ['T', 2];
            } else {
                this.next = ['0', 'T', 2];
            }
        } else if (buffer.substring(position + 1, position + 3) === 'T' || buffer.substring(position + 1, position + 3) === 'D') {
            this.next = ['T', 2];
        } else {
            this.next = ['T', 1];
        }
    }

    processV(word) {
        if (word[this.position + 1] === 'V') {
            this.next = ['F', 2];
        } else {
            this.next = ['F', 1];
        }
    }

    processW(word) {
        if (word[this.position + 1] === 'R') {
            this.next = ['R', 2];
        } else if (this.position === 0 && (VOWELS.includes(word[this.position + 1]) || word[this.position + 1] === 'H')) {
            if (VOWELS.includes(word[this.position + 1])) {
                this.next = ['A', 'F', 1];
            } else {
                this.next = ['A', 1];
            }
        } else if (((word[this.position - 1] === 'E' || word[this.position - 1] === 'O') && word[this.position + 1] === 'S' && word[this.position + 2] === 'H') || (this.position === word.length - 1 && VOWELS.includes(word[this.position - 1]))) {
            this.next = [' ', 'F', 1];
        } else if (word[this.position + 1] === 'H') {
            this.next = ['F', 2];
        } else if (word[this.position + 1] === 'W') {
            this.next = ['F', 2];
        } else {
            this.next = ['W', 1];
        }
    }

    processX(word) {
        if (this.position === 0) {
            this.next = ['S', 1];
        } else {
            this.next = ['K', 'S', 1];
        }
        if (word[this.position + 1] === 'X') {
            this.next[1] += 1;
        }
    }

    processZ(word) {
        if (word[this.position + 1] === 'H') {
            this.next = ['J', 2];
        } else if (word.substring(this.position + 1, this.position + 3) === 'ZO' || word.substring(this.position + 1, this.position + 3) === 'ZI' || word.substring(this.position + 1, this.position + 3) === 'ZA' || this.isSlavoGermanic(word)) {
            this.next = ['S', 'TS', 1];
        } else {
            this.next = ['S', 1];
        }
        if (word[this.position + 1] === 'Z') {
            this.next[1] += 1;
        }
    }

    isSlavoGermanic(word) {
        return (word.includes('W') || word.includes('K') || word.includes('CZ') || word.includes('WITZ'));
    }
}

function doubleMetaphone(input) {
    const length = input.length;
    const primary = [];
    const secondary = [];

    const upperCaseWord = input.toUpperCase();
    let index = 0;
    let result;

    while (index < length) {
        const char = upperCaseWord[index];
        const doubleMetaphone = new DoubleMetaphoneProcessor(index);
        if (char === ' ') {
            index++;
            continue;
        }
        switch (char) {
            case 'A': case 'E': case 'I': case 'O': case 'U': case 'Y':
                doubleMetaphone.processInitialVowels(upperCaseWord);
                break;
            case 'B':
                doubleMetaphone.processB(upperCaseWord);
                break;
            case 'C':
                doubleMetaphone.processC(upperCaseWord);
                break;
            case 'D':
                doubleMetaphone.processD(upperCaseWord);
                break;
            case 'F':
                doubleMetaphone.processF(upperCaseWord);
                break;
            case 'G':
                doubleMetaphone.processG(upperCaseWord);
                break;
            case 'H':
                doubleMetaphone.processH(upperCaseWord);
                break;
            case 'J':
                doubleMetaphone.processJ(upperCaseWord);
                break;
            case 'K':
                doubleMetaphone.processK(upperCaseWord);
                break;
            case 'L':
                doubleMetaphone.processL(upperCaseWord);
                break;
            case 'M':
                doubleMetaphone.processM(upperCaseWord);
                break;
            case 'N':
                doubleMetaphone.processN(upperCaseWord);
                break;
            case 'P':
                doubleMetaphone.processP(upperCaseWord);
                break;
            case 'Q':
                doubleMetaphone.processQ(upperCaseWord);
                break;
            case 'R':
                doubleMetaphone.processR(upperCaseWord);
                break;
            case 'S':
                doubleMetaphone.processS(upperCaseWord);
                break;
            case 'T':
                doubleMetaphone.processT(upperCaseWord);
                break;
            case 'V':
                doubleMetaphone.processV(upperCaseWord);
                break;
            case 'W':
                doubleMetaphone.processW(upperCaseWord);
                break;
            case 'X':
                doubleMetaphone.processX(upperCaseWord);
                break;
            case 'Z':
                doubleMetaphone.processZ(upperCaseWord);
                break;
            default:
                doubleMetaphone.next = [null, 1];
                break;
        }

        result = doubleMetaphone.next;

        if (result.length === 2) {
            if (result[0] && typeof result[0] === 'string') {
                primary.push(result[0]);
                secondary.push(result[1]);
            }
            index += result[1];
        } else if (result.length === 3) {
            if (result[0] && typeof result[0] === 'string') {
                primary.push(result[0]);
            }
            if (result[1] && typeof result[1] === 'string') {
                secondary.push(result[1]);
            }
            index += result[2];
        }
    }

    return [primary.join(''), secondary.join('')];
}

module.exports = doubleMetaphone;

// TODO: check the algorithm output here against WFP python version
function test() {

    // cleans a single value in a name column (whitespace and other)
    function cleanNameColumn(value) {
        // remove all whitespace and digits from all name fields
        let cleaned = value.replaceAll(/[\s]+/g, "")
            .replaceAll(/[\d]+/g, "")
        // for names with Arabic letters, run the following regex replacements
        // ة becomes ه
        cleaned = cleaned.replaceAll("ة", "ه");
        // any of: أ  ئ ؤ ء ى becomes ا
        cleaned = cleaned.replaceAll(/أئؤءى/g, "ا");

        return cleaned;
    }


    function convertWord(word) {
        let transliterated = transliterate(cleanNameColumn(word), ar2SafeBwMap);
        let mp = doubleMetaphone(transliterated);
        console.log("\t", word, "\t\t", transliterated, '\t\t', mp)
        return mp;
    }

    const transliterate = require('./transliteration');
    const ar2SafeBwMap = require('./transliteration-mapping-ar2safebw');

    ["هايل,عجرمة (العجارمة),رائد,صيداوي,اعتماد",
    "جدير,تميم,رائد,صيداوي,اعتماد"].forEach(row => row.split(",").forEach(convertWord))

}

// test()