export default function formatNumber(pInput) {
  const options = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  let n = parseFloat(pInput).toFixed(2);
  let withCommas = Number(n).toLocaleString("en", options);
  return withCommas;
}
