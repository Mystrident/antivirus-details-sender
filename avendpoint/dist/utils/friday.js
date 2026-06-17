export function isFriday() {
    return new Date().getDay() === 5;
}
export function getTodayString() {
    return new Date().toISOString().split("T")[0];
}
