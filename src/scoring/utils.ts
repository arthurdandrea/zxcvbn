// binomial coefficients
// src: http://blog.plover.com/math/choose.html
export function nCk(n: number, k: number) {
  let count = n
  if (k > count) {
    return 0
  }
  if (k === 0) {
    return 1
  }
  let coEff = 1
  for (let i = 1; i <= k; i += 1) {
    coEff *= count
    coEff /= i
    count -= 1
  }
  return coEff
}

export const log10 = Math.log10 ?? ((n: number) => Math.log(n) / Math.log(10))

export const log2 =
  Math.log2 ??
  (Math.LOG2E
    ? (n: number) => Math.log(n) * Math.LOG2E
    : (n: number) => Math.log(n) / Math.log(2))

export function factorial(num: number) {
  let rval = 1
  for (let i = 2; i <= num; i += 1) rval *= i
  return rval
}
