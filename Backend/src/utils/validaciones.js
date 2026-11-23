export const esId=id=>Number.isSafeInteger(Number(id))&&Number(id)>0;
export const esCorreo=correo=>typeof correo==="string"&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
