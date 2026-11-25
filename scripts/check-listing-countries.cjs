const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
function load(file, require) {
  const exports = {}
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  vm.runInNewContext(source, { exports, require, Intl })
  return exports
}
const countries = load('lib/countries.ts')
const { listingVisibleInCountry, listingBelongsToCountry } = load('lib/catalogueCountry.ts', () => countries)
const car = { country: 'Latvija', visibility_country_codes: ['lv', 'lt'] }
assert.equal(listingVisibleInCountry(car, 'lv'), true)
assert.equal(listingVisibleInCountry(car, 'lt'), true)
assert.equal(listingVisibleInCountry(car, 'de'), false)
assert.equal(listingBelongsToCountry(car, 'lt'), false, 'Location remains independent from target markets')
assert.equal(listingBelongsToCountry(car, 'lv'), true)
for (const country of countries.COUNTRIES) {
  assert.equal(listingVisibleInCountry({ ...car, visibility_country_codes: ['*'] }, country.code), true)
}
for (const visibility_country_codes of [undefined, null]) {
  assert.equal(listingVisibleInCountry({ country: 'Latvija', visibility_country_codes }, 'lv'), true)
  assert.equal(listingVisibleInCountry({ country: 'Latvija', visibility_country_codes }, 'lt'), false)
}
assert.equal(listingVisibleInCountry({ ...car, visibility_country_codes: [] }, 'lv'), false)
const keys = ['Valstis, kurās rādīt sludinājumu', 'Meklēt valsti', 'Izvēlies vismaz vienu valsti vai atzīmē “Visas valstis”.']
for (const file of fs.readdirSync(path.join(root, 'lib/i18n')).filter(file => file.endsWith('.json'))) {
  const dictionary = JSON.parse(fs.readFileSync(path.join(root, 'lib/i18n', file), 'utf8'))
  for (const key of keys) assert.ok(dictionary[key], `${file}: ${key}`)
}
console.log('PASS: selected markets, exclusions, all countries, legacy listings, independent location, 26-language UI')
