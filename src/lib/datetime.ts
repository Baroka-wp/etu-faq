/** Fuseau horaire de référence pour les planifications ETU (Bénin, UTC+1). */
export const APP_TIMEZONE = 'Africa/Porto-Novo'

const WEEKDAY_EN: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
}

export function getAppDayOfWeek(d: Date): number {
    const wd = new Intl.DateTimeFormat('en-US', { timeZone: APP_TIMEZONE, weekday: 'long' }).format(d)
    return WEEKDAY_EN[wd] ?? 0
}

export function getAppHourMinute(d: Date): { hour: number; minute: number } {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: APP_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(d)
    const hour = Number(parts.find(p => p.type === 'hour')?.value ?? 0)
    const minute = Number(parts.find(p => p.type === 'minute')?.value ?? 0)
    return { hour, minute }
}

/** Décalage en minutes par rapport à UTC pour une date donnée (gère DST si le fuseau en a). */
function getTimezoneOffsetMinutes(timeZone: string, at: Date): number {
    const utc = new Date(at.toLocaleString('en-US', { timeZone: 'UTC' }))
    const zoned = new Date(at.toLocaleString('en-US', { timeZone }))
    return (zoned.getTime() - utc.getTime()) / 60_000
}

/**
 * Interprète une valeur `datetime-local` (ex. "2026-05-01T21:00") comme heure locale APP_TIMEZONE
 * et retourne l'instant UTC à stocker en base.
 */
export function parseAppDatetimeLocal(value: string): Date {
    const [datePart, timePart = '00:00'] = value.split('T')
    const [y, mo, d] = datePart.split('-').map(Number)
    const [h, mi] = timePart.split(':').map(Number)
    const probe = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0))
    const offsetMin = getTimezoneOffsetMinutes(APP_TIMEZONE, probe)
    return new Date(Date.UTC(y, mo - 1, d, h, mi, 0, 0) - offsetMin * 60_000)
}

/** Formate un instant UTC pour un champ `datetime-local` (heure APP_TIMEZONE). */
export function formatAppDatetimeLocal(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: APP_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(d)
    const get = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find(p => p.type === type)?.value ?? '00'
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}

type DateFormatOptions = Intl.DateTimeFormatOptions

export function formatAppDate(date: Date | string, options?: DateFormatOptions): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('fr-FR', { timeZone: APP_TIMEZONE, ...options })
}

export function formatAppTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const t = d.toLocaleTimeString('fr-FR', {
        timeZone: APP_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })
    return t
}

/** Heure compacte pour affichage (ex. "21h", "21h30"). */
export function formatAppHourShort(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const parts = new Intl.DateTimeFormat('fr-FR', {
        timeZone: APP_TIMEZONE,
        hour: 'numeric',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(d)
    const h = parts.find(p => p.type === 'hour')?.value ?? '0'
    const m = parts.find(p => p.type === 'minute')?.value ?? '00'
    return m === '00' ? `${h}h` : `${h}h${m}`
}

/** Date au format YYYY-MM-DD dans APP_TIMEZONE. */
export function formatAppDateYMD(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: APP_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(d)
}

/**
 * Corrige un instant enregistré avant le correctif fuseau :
 * les composantes UTC (= heure affichée dans le champ datetime-local) étaient stockées comme UTC
 * au lieu d'être interprétées en APP_TIMEZONE.
 */
export function fixMisstoredAppDatetime(date: Date): Date {
    const y = date.getUTCFullYear()
    const mo = String(date.getUTCMonth() + 1).padStart(2, '0')
    const d = String(date.getUTCDate()).padStart(2, '0')
    const h = String(date.getUTCHours()).padStart(2, '0')
    const mi = String(date.getUTCMinutes()).padStart(2, '0')
    return parseAppDatetimeLocal(`${y}-${mo}-${d}T${h}:${mi}`)
}

/** Bornes d'un mois en APP_TIMEZONE (mois = 0 pour le mois de `reference`). */
export function appMonthBounds(reference = new Date(), monthOffset = 0): { start: Date; end: Date } {
    const y = Number(formatAppDate(reference, { year: 'numeric' }))
    const m = Number(formatAppDate(reference, { month: 'numeric' })) - 1 + monthOffset
    const anchor = new Date(Date.UTC(y, m, 15))
    const year = Number(formatAppDate(anchor, { year: 'numeric' }))
    const month = formatAppDate(anchor, { month: '2-digit' })
    const start = parseAppDatetimeLocal(`${year}-${month}-01T00:00`)
    const nextM = Number(month) === 12 ? { y: year + 1, m: '01' } : { y: year, m: String(Number(month) + 1).padStart(2, '0') }
    const startNext = parseAppDatetimeLocal(`${nextM.y}-${nextM.m}-01T00:00`)
    const end = new Date(startNext.getTime() - 1)
    return { start, end }
}
