export function daysBetween(date) {
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}
export function daysUntil(date) {
    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
