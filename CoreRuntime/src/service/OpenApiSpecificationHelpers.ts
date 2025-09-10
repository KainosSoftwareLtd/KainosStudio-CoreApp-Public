import { OpenApiSpecification, Server } from './Service.js';

export function findEndpointByOperationId(apiSpec: OpenApiSpecification, operationId: string) {
  for (const [path, methods] of Object.entries(apiSpec.paths)) {
    const pathServers = methods.servers || apiSpec.servers; // Checking for servers at path level or root level
    for (const [method, operation] of Object.entries(methods)) {
      if (operation.operationId === operationId) {
        const methodServers = operation.servers || pathServers; // Using servers from operation if available, else fallback to path or root
        const resolvedServers = methodServers?.map(replaceServerVariables) || [];

        return { url: resolvedServers[0] + path, method: method.toUpperCase() };
      }
    }
  }
  return null;
}

function replaceServerVariables(server: Server): string {
  let url = server.url;

  if (server.variables) {
    for (const [variableName, variable] of Object.entries(server.variables)) {
      const valueToReplace = variable.default;
      url = url.replace(`{${variableName}}`, valueToReplace);
    }
  }

  return url;
}
