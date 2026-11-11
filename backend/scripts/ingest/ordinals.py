"""
Ordinal word conversion utilities for Constitution of India Amendment Acts (1..106).
"""
import re

ONES = {
    'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5,
    'sixth': 6, 'seventh': 7, 'eighth': 8, 'ninth': 9, 'tenth': 10,
    'eleventh': 11, 'twelfth': 12, 'thirteenth': 13, 'fourteenth': 14,
    'fifteenth': 15, 'sixteenth': 16, 'seventeenth': 17, 'eighteenth': 18,
    'nineteenth': 19
}

TENS = {
    'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
    'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
}

WORDS_TO_NUM = dict(ONES)
WORDS_TO_NUM['twentieth'] = 20
WORDS_TO_NUM['thirtieth'] = 30
WORDS_TO_NUM['fortieth'] = 40
WORDS_TO_NUM['fiftieth'] = 50
WORDS_TO_NUM['sixtieth'] = 60
WORDS_TO_NUM['seventieth'] = 70
WORDS_TO_NUM['eightieth'] = 80
WORDS_TO_NUM['ninetieth'] = 90

for t_word, t_val in TENS.items():
    WORDS_TO_NUM[t_word] = t_val
    for o_word, o_val in ONES.items():
        if o_val < 10:
            WORDS_TO_NUM[f'{t_word}-{o_word}'] = t_val + o_val
            WORDS_TO_NUM[f'{t_word} {o_word}'] = t_val + o_val

WORDS_TO_NUM['hundredth'] = 100
WORDS_TO_NUM['one hundredth'] = 100

for o_word, o_val in ONES.items():
    if o_val <= 6:
        WORDS_TO_NUM[f'one hundred and {o_word}'] = 100 + o_val
        WORDS_TO_NUM[f'one hundred {o_word}'] = 100 + o_val
        WORDS_TO_NUM[f'hundred and {o_word}'] = 100 + o_val

NUM_TO_WORDS = {
    1: 'First', 2: 'Second', 3: 'Third', 4: 'Fourth', 5: 'Fifth',
    6: 'Sixth', 7: 'Seventh', 8: 'Eighth', 9: 'Ninth', 10: 'Tenth',
    11: 'Eleventh', 12: 'Twelfth', 13: 'Thirteenth', 14: 'Fourteenth', 15: 'Fifteenth',
    16: 'Sixteenth', 17: 'Seventeenth', 18: 'Eighteenth', 19: 'Nineteenth', 20: 'Twentieth',
    21: 'Twenty-first', 22: 'Twenty-second', 23: 'Twenty-third', 24: 'Twenty-fourth', 25: 'Twenty-fifth',
    26: 'Twenty-sixth', 27: 'Twenty-seventh', 28: 'Twenty-eighth', 29: 'Twenty-ninth', 30: 'Thirtieth',
    31: 'Thirty-first', 32: 'Thirty-second', 33: 'Thirty-third', 34: 'Thirty-fourth', 35: 'Thirty-fifth',
    36: 'Thirty-sixth', 37: 'Thirty-seventh', 38: 'Thirty-eighth', 39: 'Thirty-ninth', 40: 'Fortieth',
    41: 'Forty-first', 42: 'Forty-second', 43: 'Forty-third', 44: 'Forty-fourth', 45: 'Forty-fifth',
    46: 'Forty-sixth', 47: 'Forty-seventh', 48: 'Forty-eighth', 49: 'Forty-ninth', 50: 'Fiftieth',
    51: 'Fifty-first', 52: 'Fifty-second', 53: 'Fifty-third', 54: 'Fifty-fourth', 55: 'Fifty-fifth',
    56: 'Fifty-sixth', 57: 'Fifty-seventh', 58: 'Fifty-eighth', 59: 'Fifty-ninth', 60: 'Sixtieth',
    61: 'Sixty-first', 62: 'Sixty-second', 63: 'Sixty-third', 64: 'Sixty-fourth', 65: 'Sixty-fifth',
    66: 'Sixty-sixth', 67: 'Sixty-seventh', 68: 'Sixty-eighth', 69: 'Sixty-ninth', 70: 'Seventieth',
    71: 'Seventy-first', 72: 'Seventy-second', 73: 'Seventy-third', 74: 'Seventy-fourth', 75: 'Seventy-fifth',
    76: 'Seventy-sixth', 77: 'Seventy-seventh', 78: 'Seventy-eighth', 79: 'Seventy-ninth', 80: 'Eightieth',
    81: 'Eighty-first', 82: 'Eighty-second', 83: 'Eighty-third', 84: 'Eighty-fourth', 85: 'Eighty-fifth',
    86: 'Eighty-sixth', 87: 'Eighty-seventh', 88: 'Eighty-eighth', 89: 'Eighty-ninth', 90: 'Ninetieth',
    91: 'Ninety-first', 92: 'Ninety-second', 93: 'Ninety-third', 94: 'Ninety-fourth', 95: 'Ninety-fifth',
    96: 'Ninety-sixth', 97: 'Ninety-seventh', 98: 'Ninety-eighth', 99: 'Ninety-ninth', 100: 'One Hundredth',
    101: 'One Hundred and First', 102: 'One Hundred and Second', 103: 'One Hundred and Third',
    104: 'One Hundred and Fourth', 105: 'One Hundred and Fifth', 106: 'One Hundred and Sixth'
}


def number_to_ordinal_suffix(n: int) -> str:
    """Return '1st', '2nd', '3rd', '4th', '42nd', '106th', etc."""
    if 11 <= (n % 100) <= 13:
        suffix = 'th'
    else:
        suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')
    return f"{n}{suffix}"


def number_to_ordinal_words(n: int) -> str:
    """Return standard title words for n (1..106), e.g. 'Forty-second'."""
    if n in NUM_TO_WORDS:
        return NUM_TO_WORDS[n]
    raise ValueError(f"Unsupported amendment number: {n}. Must be between 1 and 106.")


def ordinal_to_number(text: str) -> int:
    """
    Parse ordinal string to number (1..106).
    Supports:
    - '42nd', '1st', '106th'
    - 'Forty-second', 'forty second', 'one hundred and sixth'
    - Filename stems or title fragments containing ordinal
    """
    normalized = re.sub(r'[_/\\.\\-]', ' ', text).strip().lower()

    if normalized in WORDS_TO_NUM:
        return WORDS_TO_NUM[normalized]

    match_num = re.search(r'\b(\d{1,3})(?:st|nd|rd|th)?\b', normalized)
    if match_num:
        val = int(match_num.group(1))
        if 1 <= val <= 106:
            return val

    for word, val in sorted(WORDS_TO_NUM.items(), key=lambda x: -len(x[0])):
        pattern = r'\b' + re.escape(word).replace(r'\-', r'[\s\-]') + r'\b'
        if re.search(pattern, normalized):
            return val

    raise ValueError(f"Could not extract ordinal number (1..106) from: {text!r}")
