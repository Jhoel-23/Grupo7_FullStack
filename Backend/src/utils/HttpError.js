export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}
export const exigir = (condicion, status, mensaje) => {
  if (!condicion) throw new HttpError(status, mensaje);
};
export const idValido = (valor) => Number.isSafeInteger(Number(valor)) && Number(valor) > 0;
