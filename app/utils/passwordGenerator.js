// Copyright (c) 2015 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

var getCharset = function (settings) {
    // 33 start symbols
    // 48 start numbers
    // 58 start symbols again
    // 65 start chars
    // 91 start symbols again
    // 97 start chars again
    // 123 start symbols again
    // 126 end (included)

    var charset = '',
    passGenUseChars = settings.getSetting('passGenUseChars'),
    passGenUseNumbers = settings.getSetting('passGenUseNumbers'),
    passGenUseSymbols = settings.getSetting('passGenUseSymbols'),
    i;

    for (i = 33; i < 127; i += 1) {
        if (i >= 33 && i < 48 && passGenUseSymbols) {
            charset += String.fromCharCode(i);
        } else if (i >= 48 && i < 58 && passGenUseNumbers) {
            charset += String.fromCharCode(i);
        } else if (i >= 58 && i < 65 && passGenUseSymbols) {
            charset += String.fromCharCode(i);
        } else if (i >= 65 && i < 91 && passGenUseChars) {
            charset += String.fromCharCode(i);
        } else if (i >= 91 && i < 97 && passGenUseSymbols) {
            charset += String.fromCharCode(i);
        } else if (i >= 97 && i < 123 && passGenUseChars) {
            charset += String.fromCharCode(i);
        } else if (i >= 123 && i < 127 && passGenUseSymbols) {
            charset += String.fromCharCode(i);
        }
    }

    return charset;
};

export default function generatePassword(settings) {
    var charset = getCharset(settings),
        length = settings.getSetting('passGenLength'),
        password = '',
        aux,
        i;

    for (i = 0; i < length; i += 1) {
        aux = Math.floor(Math.random() * charset.length);
        password += charset.charAt(aux);
    }

    return password;
}
