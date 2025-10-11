// https://stackoverflow.com/questions/9083037/convert-a-number-into-a-roman-numeral-in-javascript

export function romanize(num: number) {
  if (isNaN(num)) return NaN;
  const digits = String(+num).split('');

  const key = [
    '',
    'C',
    'CC',
    'CCC',
    'CD',
    'D',
    'DC',
    'DCC',
    'DCCC',
    'CM',
    '',
    'X',
    'XX',
    'XXX',
    'XL',
    'L',
    'LX',
    'LXX',
    'LXXX',
    'XC',
    '',
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX',
  ];
  let roman = '';
  let i = 3;

  while (i--) {
    const digit = digits.pop();

    if (digit) {
      roman = (key[+digit + i * 10] || '') + roman;
    }
  }
  return Array(+digits.join('') + 1).join('M') + roman;
}

export const parsePositiveIntegerParam = (s: string | null): number | null => {
  if (!s) return null;
  const t = s.trim();
  if (!/^[0-9]\d*$/.test(t)) return null;

  const n = Number(t);
  return Number.isSafeInteger(n) ? n : null;
};
