export const environment = {
  production: false,
  baseUrl: 'http://controlesusuario-api.sa-east-1.elasticbeanstalk.com',
  // Em desenvolvimento, permitir requisições sem token quando true (apenas para testes locais)
  allowUnauthenticatedRequestsInDev: true,
  // Fill with your n8n webhook workflow id after importing the workflow (e.g. 'a1b2c3d4-...')
  n8nWorkflowId: ''
};

