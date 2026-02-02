export function getSearchParamNumber(
  value: string | string[] | undefined,
  defaultValue: number,
): number {
  if (typeof value === 'string') {
    const parsedNumber = Number(value)
    return Number.isNaN(parsedNumber) ? defaultValue : parsedNumber
  }

  return defaultValue
}