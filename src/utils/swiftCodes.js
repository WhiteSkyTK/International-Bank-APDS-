// src/utils/swiftCodes.js
/**
 * Pre-populated list of common international SWIFT / BIC codes.
 * Format: { code, bank, country, flag }
 * Users can pick from this list or type their own — both are valid.
 */
export const SWIFT_CODES = [
    // South Africa
    { code: 'ABSAZAJJ', bank: 'Absa Bank',               country: 'South Africa', flag: '🇿🇦' },
    { code: 'FIRNZAJJ', bank: 'First National Bank (FNB)',country: 'South Africa', flag: '🇿🇦' },
    { code: 'NEDSZAJJ', bank: 'Nedbank',                  country: 'South Africa', flag: '🇿🇦' },
    { code: 'SBZAZAJJ', bank: 'Standard Bank',            country: 'South Africa', flag: '🇿🇦' },
    { code: 'CABLZAJJ', bank: 'Capitec Bank',             country: 'South Africa', flag: '🇿🇦' },
    // USA
    { code: 'CHASUS33', bank: 'JPMorgan Chase',           country: 'United States', flag: '🇺🇸' },
    { code: 'BOFAUS3N', bank: 'Bank of America',          country: 'United States', flag: '🇺🇸' },
    { code: 'WFBIUS6S', bank: 'Wells Fargo',              country: 'United States', flag: '🇺🇸' },
    { code: 'CITIUS33', bank: 'Citibank',                 country: 'United States', flag: '🇺🇸' },
    // UK
    { code: 'BARCGB22', bank: 'Barclays',                 country: 'United Kingdom', flag: '🇬🇧' },
    { code: 'HBUKGB4B', bank: 'HSBC UK',                  country: 'United Kingdom', flag: '🇬🇧' },
    { code: 'LOYDGB2L', bank: 'Lloyds Bank',              country: 'United Kingdom', flag: '🇬🇧' },
    { code: 'NWBKGB2L', bank: 'NatWest',                  country: 'United Kingdom', flag: '🇬🇧' },
    // Europe
    { code: 'DEUTDEDB', bank: 'Deutsche Bank',            country: 'Germany',       flag: '🇩🇪' },
    { code: 'BNPAFRPP', bank: 'BNP Paribas',              country: 'France',        flag: '🇫🇷' },
    { code: 'INGBNL2A', bank: 'ING Bank',                 country: 'Netherlands',   flag: '🇳🇱' },
    { code: 'UBSWCHZH', bank: 'UBS',                      country: 'Switzerland',   flag: '🇨🇭' },
    { code: 'CRESCHZZ', bank: 'Credit Suisse',            country: 'Switzerland',   flag: '🇨🇭' },
    // Asia
    { code: 'HSBCHKHH', bank: 'HSBC Hong Kong',           country: 'Hong Kong',     flag: '🇭🇰' },
    { code: 'ICBKCNBJ', bank: 'ICBC China',               country: 'China',         flag: '🇨🇳' },
    { code: 'MUFGJPJU', bank: 'MUFG Bank',                country: 'Japan',         flag: '🇯🇵' },
    // Australia
    { code: 'ANZBAU3M', bank: 'ANZ Bank',                 country: 'Australia',     flag: '🇦🇺' },
    { code: 'CTBAAU2S', bank: 'Commonwealth Bank',        country: 'Australia',     flag: '🇦🇺' },
];

export const CURRENCIES = [
    { code: 'ZAR', symbol: 'R',  name: 'South African Rand',  flag: '🇿🇦' },
    { code: 'USD', symbol: '$',  name: 'US Dollar',           flag: '🇺🇸' },
    { code: 'EUR', symbol: '€',  name: 'Euro',                flag: '🇪🇺' },
    { code: 'GBP', symbol: '£',  name: 'British Pound',       flag: '🇬🇧' },
    { code: 'JPY', symbol: '¥',  name: 'Japanese Yen',        flag: '🇯🇵' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar',   flag: '🇦🇺' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar',     flag: '🇨🇦' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc',         flag: '🇨🇭' },
    { code: 'CNY', symbol: '¥',  name: 'Chinese Yuan',        flag: '🇨🇳' },
];