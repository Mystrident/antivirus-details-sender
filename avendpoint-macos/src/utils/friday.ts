export function isFriday(): boolean {
  return new Date().getDay() === 5;
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}
