/**
 * Operations Research: Statistical Distribution Engine
 * 
 * Provides Abramowitz and Stegun error function (erf) approximation,
 * Normal Cumulative Distribution Function (CDF), and Peter J. Acklam's
 * inverse normal CDF (quantile / probit function).
 */

/**
 * Abramowitz and Stegun approximation 7.1.26 for the Error Function (erf).
 * Maximum absolute error < 1.5e-7. No external dependencies.
 *
 * @param x - Input value
 * @returns erf(x)
 */
export function erf(x: number): number {
  if (x === 0) return 0;
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);
  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const t = 1 / (1 + p * absX);
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  return sign * (1 - poly * Math.exp(-absX * absX));
}

/**
 * Standard Normal Cumulative Distribution Function (CDF).
 * Evaluates P(X <= x) where X ~ Normal(mean, stdDev).
 *
 * @param x - Target value
 * @param mean - Expected mean (project duration)
 * @param stdDev - Standard deviation (project sigma)
 * @returns Probability between 0 and 1
 */
export function normalCdf(x: number, mean: number, stdDev: number): number {
  if (!Number.isFinite(x)) return x < mean ? 0 : 1;
  if (stdDev <= 0) {
    return x >= mean ? 1 : 0;
  }
  const z = (x - mean) / (stdDev * Math.SQRT2);
  return 0.5 * (1 + erf(z));
}

/**
 * Inverse Normal Cumulative Distribution Function (Quantile / Probit function)
 * using Peter J. Acklam's rational approximation algorithm.
 * Computes x such that P(X <= x) = p for X ~ Normal(mean, stdDev).
 *
 * @param p - Probability (0 < p < 1)
 * @param mean - Expected mean (default 0)
 * @param stdDev - Standard deviation (default 1)
 * @returns Quantile value x
 */
export function inverseNormalCdf(p: number, mean = 0, stdDev = 1): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (stdDev === 0) return mean;

  const a = [
    -3.969683028665376e1,
    2.209460984245205e2,
    -2.759285104469687e2,
    1.38357751867269e2,
    -3.066479806614716e1,
    2.506628277459239e0,
  ];

  const b = [
    -5.447609879822406e1,
    1.615858368580409e2,
    -1.556989798598866e2,
    6.680131188771972e1,
    -1.328068155288572e1,
  ];

  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838e0,
    -2.549732539343734e0,
    4.374664141464968e0,
    2.938163982698783e0,
  ];

  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996e0,
    3.754408661907416e0,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number;
  let r: number;
  let z: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    z =
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    z =
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    z =
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  return mean + z * stdDev;
}
