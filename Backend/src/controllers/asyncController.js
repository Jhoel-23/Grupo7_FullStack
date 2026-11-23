/** Conecta el controlador HTTP con la capa de servicios sin mezclar Express en la lógica. */
export const asyncController = (fn, status = 200) => (req, res, next) => {
  Promise.resolve().then(() => fn(req)).then(resultado => res.status(status).json(resultado)).catch(next);
};
