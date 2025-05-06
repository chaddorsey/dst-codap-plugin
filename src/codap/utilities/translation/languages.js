"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.translations = exports.getBaseLanguage = void 0
let en_US_json5_1 = require("./lang/en-US.json5")
let de_json_1 = require("./lang/de.json")
let el_json_1 = require("./lang/el.json")
let es_json_1 = require("./lang/es.json")
let fa_json_1 = require("./lang/fa.json")
let he_json_1 = require("./lang/he.json")
let ja_json_1 = require("./lang/ja.json")
let ko_json_1 = require("./lang/ko.json")
let nb_json_1 = require("./lang/nb.json")
let nn_json_1 = require("./lang/nn.json")
let pt_BR_json_1 = require("./lang/pt-BR.json")
let th_json_1 = require("./lang/th.json")
let tr_json_1 = require("./lang/tr.json")
let zh_Hans_json_1 = require("./lang/zh-Hans.json")
let zh_TW_json_1 = require("./lang/zh-TW.json")
// returns baseLANG from baseLANG-REGION if REGION exists
// this will, for example, convert en-US to en
let getBaseLanguage = function (langKey) {
    return langKey.split("-")[0]
}
exports.getBaseLanguage = getBaseLanguage
let languageFiles = [
    { key: 'de', contents: de_json_1.default }, // German
    { key: 'el', contents: el_json_1.default }, // Greek
    { key: 'en-US', contents: en_US_json5_1.default }, // US English
    { key: 'es', contents: es_json_1.default }, // Spanish
    { key: 'fa', contents: fa_json_1.default }, // Farsi (Persian)
    { key: 'he', contents: he_json_1.default }, // Hebrew
    { key: 'ja', contents: ja_json_1.default }, // Japanese
    { key: 'ko', contents: ko_json_1.default }, // Korean
    { key: 'nb', contents: nb_json_1.default }, // Norwegian Bokmål
    { key: 'nn', contents: nn_json_1.default }, // Norwegian Nynorsk
    { key: 'pt-BR', contents: pt_BR_json_1.default }, // Brazilian Portuguese
    { key: 'th', contents: th_json_1.default }, // Thai
    { key: 'tr', contents: tr_json_1.default }, // Turkish
    { key: 'zh-Hans', contents: zh_Hans_json_1.default }, // Simplified Chinese
    { key: 'zh-TW', contents: zh_TW_json_1.default } // Traditional Chinese (Taiwan)
]
exports.translations = {}
languageFiles.forEach(function (langFile) {
    exports.translations[langFile.key] = langFile.contents
    // accept full key with region code or just the language code
    let bLang = (0, exports.getBaseLanguage)(langFile.key)
    if (bLang && !exports.translations[bLang]) {
        exports.translations[bLang] = langFile.contents
    }
})
