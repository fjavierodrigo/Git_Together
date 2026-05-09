export const getApiBaseUrl = () => {
  const host = window.location.hostname;
  
  // Si estamos en tu ordenador (Local)
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:8080';
  }

  // SIEMPRE usar la IP de tu instancia EC2 cuando estemos en AWS (S3)
  // Reemplaza esta IP si llega a cambiar en el futuro
  return 'http://52.0.164.75:8080'; 
};
