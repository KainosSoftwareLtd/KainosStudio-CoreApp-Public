import { OpenApiSpecification } from '../../src/service/Service.js';
import { findEndpointByOperationId } from '../../src/service/OpenApiSpecificationHelpers.js';

describe('OpenApiSpecificationHelpers', () => {
  let apiSpec: OpenApiSpecification;

  beforeEach(() => {
    apiSpec = {
      servers: [
        {
          url: 'https://{environment}.api.com',
          variables: {
            environment: {
              default: 'dev',
            },
          },
        },
      ],
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
          },
          post: {
            operationId: 'createUser',
            servers: [
              {
                url: 'https://{env}.custom.com',
                variables: {
                  env: {
                    default: 'test',
                  },
                },
              },
            ],
          },
        },
        '/products': {
          servers: [
            {
              url: 'https://{env}.products.com',
              variables: {
                env: {
                  default: 'prod',
                },
              },
            },
          ],
          get: {
            operationId: 'getProducts',
          },
        },
      },
    } as OpenApiSpecification;
  });

  test('should find endpoint with root level server', () => {
    const result = findEndpointByOperationId(apiSpec, 'getUsers');

    expect(result).toEqual({
      url: 'https://dev.api.com/users',
      method: 'GET',
    });
  });

  test('should find endpoint with operation level server', () => {
    const result = findEndpointByOperationId(apiSpec, 'createUser');

    expect(result).toEqual({
      url: 'https://test.custom.com/users',
      method: 'POST',
    });
  });

  test('should find endpoint with path level server', () => {
    const result = findEndpointByOperationId(apiSpec, 'getProducts');

    expect(result).toEqual({
      url: 'https://prod.products.com/products',
      method: 'GET',
    });
  });

  test('should return null for non-existent operationId', () => {
    const result = findEndpointByOperationId(apiSpec, 'nonExistent');

    expect(result).toBeNull();
  });
});
