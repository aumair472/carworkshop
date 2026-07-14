// Country / state (emirate) options for admin modules. Widen here when the
// business expands beyond the UAE — no schema change needed (TEXT columns).

export interface CountryOption {
  code: string
  name: string
  flag: string
}

export const COUNTRIES: CountryOption[] = [
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
]

export const STATES_BY_COUNTRY: Record<string, string[]> = {
  AE: [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ajman',
    'Ras Al Khaimah',
    'Fujairah',
    'Umm Al Quwain',
  ],
}

export function countryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? code
}

export function countryFlag(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.flag ?? '🏳️'
}
