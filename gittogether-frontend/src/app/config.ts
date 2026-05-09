export const getApiBaseUrl = () => {
  const host = window.location.hostname;
  // Si estamos en local (localhost o 127.0.0.1), usamos localhost
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:8080';
  }
  // En AWS o cualquier otro servidor, usamos la IP/dominio actual
  return `http://${host}:8080`;
};
