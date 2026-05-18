// Règles de récurrence pour les planifications.
// Réutilisé côté serveur (génération définitive) et côté client (aperçu).

export type RecurrenceUnit = 'day' | 'week' | 'month'
export type RecurrenceMode = 'interval' | 'weekdays'
export type RecurrenceEndMode = 'count' | 'until'

export interface RecurrenceRule {
    mode: RecurrenceMode
    interval?: number
    unit?: RecurrenceUnit
    weekdays?: number[]
    endMode: RecurrenceEndMode
    count?: number
    until?: string
}

export const MAX_OCCURRENCES = 52

function addDays(d: Date, n: number): Date {
    const r = new Date(d)
    r.setDate(r.getDate() + n)
    return r
}

function addMonths(d: Date, n: number): Date {
    const r = new Date(d)
    const targetDay = r.getDate()
    r.setDate(1)
    r.setMonth(r.getMonth() + n)
    const lastOfTargetMonth = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate()
    r.setDate(Math.min(targetDay, lastOfTargetMonth))
    return r
}

function sameYMD(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate()
}

export interface ValidationResult {
    ok: boolean
    error?: string
}

export function validateRecurrence(rule: RecurrenceRule, startDate: Date): ValidationResult {
    if (rule.mode === 'interval') {
        if (!rule.unit) return { ok: false, error: 'Unité de récurrence manquante' }
        if (!rule.interval || rule.interval < 1) return { ok: false, error: "L'intervalle doit être >= 1" }
    } else if (rule.mode === 'weekdays') {
        if (!rule.weekdays || rule.weekdays.length === 0) {
            return { ok: false, error: 'Sélectionne au moins un jour de la semaine' }
        }
        if (rule.weekdays.some(w => w < 0 || w > 6)) {
            return { ok: false, error: 'Jours de la semaine invalides' }
        }
    } else {
        return { ok: false, error: 'Mode de récurrence invalide' }
    }

    if (rule.endMode === 'count') {
        if (!rule.count || rule.count < 1) return { ok: false, error: "Nombre d'occurrences invalide" }
        if (rule.count > MAX_OCCURRENCES) return { ok: false, error: `Maximum ${MAX_OCCURRENCES} occurrences` }
    } else if (rule.endMode === 'until') {
        if (!rule.until) return { ok: false, error: 'Date de fin manquante' }
        const end = new Date(rule.until)
        if (Number.isNaN(end.getTime())) return { ok: false, error: 'Date de fin invalide' }
        if (end < startDate) return { ok: false, error: 'La date de fin est antérieure à la date de début' }
    } else {
        return { ok: false, error: 'Mode de fin invalide' }
    }

    return { ok: true }
}

// Génère la liste ordonnée des occurrences (incluant la date de départ si elle correspond à la règle).
// Tronquée à MAX_OCCURRENCES par sécurité.
export function generateOccurrences(rule: RecurrenceRule, startDate: Date): Date[] {
    const v = validateRecurrence(rule, startDate)
    if (!v.ok) return []

    const limit = rule.endMode === 'count'
        ? Math.min(rule.count || MAX_OCCURRENCES, MAX_OCCURRENCES)
        : MAX_OCCURRENCES

    const untilDate = rule.endMode === 'until' && rule.until ? new Date(rule.until) : null
    if (untilDate) {
        untilDate.setHours(23, 59, 59, 999)
    }

    const results: Date[] = []

    if (rule.mode === 'interval') {
        const interval = rule.interval || 1
        const unit = rule.unit || 'week'
        let i = 0
        while (results.length < limit) {
            let next: Date
            if (unit === 'day') next = addDays(startDate, i * interval)
            else if (unit === 'week') next = addDays(startDate, i * interval * 7)
            else next = addMonths(startDate, i * interval)
            if (untilDate && next > untilDate) break
            results.push(next)
            i += 1
            if (i > 1000) break
        }
    } else {
        const weekdays = new Set(rule.weekdays || [])
        // On parcourt jour par jour à partir de startDate.
        let cursor = new Date(startDate)
        let safety = 0
        while (results.length < limit && safety < 365 * 5) {
            const dow = cursor.getDay()
            if (weekdays.has(dow)) {
                const occ = new Date(startDate)
                occ.setFullYear(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())
                if (untilDate && occ > untilDate) break
                if (results.length === 0 || !sameYMD(results[results.length - 1], occ)) {
                    results.push(occ)
                }
            }
            cursor = addDays(cursor, 1)
            safety += 1
        }
    }

    return results
}

export function formatYMD(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}
