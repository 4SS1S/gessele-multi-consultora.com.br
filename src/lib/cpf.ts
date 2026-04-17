/** Remove tudo que não é dígito */
export function cpfDigitsOnly(cpf: string) {
  return cpf.replace(/\D/g, "");
}

/** Formata para 000.000.000-00 */
export function formatCPF(value: string) {
  const digits = cpfDigitsOnly(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Valida CPF com dígitos verificadores */
export function validateCPF(cpf: string): boolean {
  const digits = cpfDigitsOnly(cpf);

  if (digits.length !== 11) return false;
  // Rejeita sequências conhecidas como inválidas (000...0, 111...1, etc.)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) {
      sum += Number(digits[i]) * (len + 1 - i);
    }
    const rem = (sum * 10) % 11;
    return rem >= 10 ? 0 : rem;
  };

  return calc(9) === Number(digits[9]) && calc(10) === Number(digits[10]);
}
