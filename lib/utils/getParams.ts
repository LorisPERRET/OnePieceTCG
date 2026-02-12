import { ReadonlyURLSearchParams } from "next/navigation"

export function getParams(
  params: ReadonlyURLSearchParams,
  parameterName: string,
  value: string,
): string {
  const newParams = new URLSearchParams(params)
  newParams.set(parameterName, value)
  return `?${newParams.toString()}`
}