const method1 = (string) => !Number.isNaN(string);

const method2 = (string) => /^[+-]?\d+(\.\d+)?$/.test(string);

const method3 = (string) => !Number.isNaN(Number(string));

const method4 = (string) => Number.isFinite(+string);

const method5 = (string) => string == Number.parseFloat(string);

const methods = [method1, method2, method3, method4, method5];

export const isStringNumeric = (string = "") =>
  methods.map((method) => method(string)).filter((result) => result).length ===
  methods.length;
