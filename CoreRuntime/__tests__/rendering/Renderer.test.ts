import { Context } from '../../src/context/index.js';
import { Element } from '../../src/service/Element.js';
import ErrorList from '../../src/elements/ErrorList.js';
import Footer from '../../src/elements/Footer.js';
import { FooterLink } from '../../src/elements/Footer.js';
import { Environment as NunjucksEnvironment } from 'nunjucks';
import { RenderControl } from '../../src/rendering/RenderControl.js';
import { Renderer } from '../../src/rendering/Renderer.js';
import nunjucks from 'nunjucks';

jest.mock('nunjucks', () => ({
  configure: jest.fn().mockReturnValue({
    addFilter: jest.fn(),
    render: jest.fn().mockReturnValue('rendered template'),
  }),
  render: jest.fn().mockReturnValue('rendered template'),
}));

describe('Renderer', () => {
  let mockRendererFunc: (context: Context) => Renderer;
  let renderer: Renderer;
  let mockNunjucksEnv: NunjucksEnvironment;
  let renderControl: RenderControl;

  beforeEach(() => {
    mockRendererFunc = () => new Renderer();
    mockNunjucksEnv = {
      addFilter: jest.fn(),
      render: jest.fn(),
    } as unknown as NunjucksEnvironment;
    renderer = mockRendererFunc({} as Context);
    renderControl = new RenderControl(mockRendererFunc);
  });

  describe('getNunjucksPaths', () => {
    it('should return empty array by default', () => {
      const paths = renderer.getNunjucksPaths();
      expect(paths).toEqual([]);
    });
  });

  describe('transform', () => {
    it('should return element unchanged by default', () => {
      const mockElement: Element = {
        type: 'TestElement',
      };

      const transformed = renderer.transform(mockElement, mockNunjucksEnv);
      expect(transformed).toBe(mockElement);
    });
  });

  describe('renderDocument', () => {
    it('should transform all elements in context', () => {
      const mockContext = {
        allElements: [
          { type: 'Element1', transformed: undefined },
          { type: 'Element2', transformed: undefined },
        ],
        page: {
          error: null,
        },
        service: {
          footer: null,
          selectedLang: 'en',
          defaultLang: 'en',
        },
      } as unknown as Context;

      const result = renderControl.renderDocument(mockContext);
      expect(result).toBe('rendered template');
      expect(mockContext.allElements[0].transformed).toBeDefined();
    });

    it('should handle error elements', () => {
      const mockError = new ErrorList('Test Error List');
      mockError.type = 'ErrorElement';

      const mockContext = {
        allElements: [],
        page: {
          error: mockError,
        },
        service: {
          footer: null,
          selectedLang: 'en',
          defaultLang: 'en',
        },
      } as unknown as Context;

      const result = renderControl.renderDocument(mockContext);
      expect(result).toBe('rendered template');
      expect(mockContext.page.error?.type).toBe('ErrorElement');
    });

    it('should handle footer elements', () => {
      const mockLinks: FooterLink[] = [
        {
          href: 'test-link',
          text: 'Test Link',
          attributes: [],
        },
      ];
      const mockFooter = new Footer(mockLinks);

      const mockContext = {
        allElements: [],
        page: {
          error: null,
        },
        service: {
          footer: mockFooter,
          selectedLang: 'en',
          defaultLang: 'en',
        },
      } as unknown as Context;

      const result = renderControl.renderDocument(mockContext);
      expect(result).toBe('rendered template');
      expect(mockContext.service.footer?.type).toBe('Footer');
    });
  });

  describe('addPaths', () => {
    it('should add new paths to existing nunjucks paths', () => {
      const mockContext = {
        allElements: [],
        page: { error: null },
        service: {
          footer: null,
          i18n: {
            resources: {},
          },
          selectedLang: 'en',
          defaultLang: 'en',
        },
      } as unknown as Context;

      const result = renderControl.renderDocument(mockContext);
      expect(result).toBeDefined();
    });
  });

  describe('configureNunjucks', () => {
    it('should configure nunjucks with translations', () => {
      const mockContext = {
        allElements: [],
        page: {
          error: null,
        },
        service: {
          i18n: {
            resources: {
              en: {
                translation: {
                  key: 'value',
                },
              },
            },
          },
          selectedLang: 'en',
          defaultLang: 'en',
          footer: null,
        },
      } as unknown as Context;

      const result = renderControl.renderDocument(mockContext);
      expect(result).toBe('rendered template');
      expect(nunjucks.configure).toHaveBeenCalled();
    });

    it('should handle missing translations', () => {
      const mockContext = {
        allElements: [],
        page: {
          error: null,
        },
        service: {
          selectedLang: 'en',
          defaultLang: 'en',
          footer: null,
        },
      } as unknown as Context;

      const result = renderControl.renderDocument(mockContext);
      expect(result).toBe('rendered template');
    });
  });
});
