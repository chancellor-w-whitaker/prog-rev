export function formatPercentage(number, decimalPlaces) {
  return isNaN(number * 100) || !isFinite(number * 100)
    ? null
    : (number * 100).toFixed(decimalPlaces) + "%";
}
