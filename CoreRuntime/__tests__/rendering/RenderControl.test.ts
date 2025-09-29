import { Context } from '../../src/context/index';
import { Element } from '../../src/service/Element';
import { RenderControl } from '../../src/rendering/RenderControl';
import { Renderer } from '../../src/rendering/Renderer';
import i18next from 'i18next';
import nunjucks from 'nunjucks';

// Mock dependencies
jest.mock('nunjucks');
jest.mock('i18next');
jest.mock('../../src/rendering/Renderer');
jest.mock('../../src/translations/StaticTranslations', () => ({
  getStaticTranslations: jest.fn(() => ({
    en: {
      test: {
        message: 'Test message',
      },
    },
  })),
}));
jest.mock('../../src/index', () => ({
  logger: {
    info: jest.fn(),
  },
}));

describe('RenderControl', () => {
  let renderControl: RenderControl;
  let mockRendererFunc: jest.Mock;
  let mockRenderer: jest.Mocked<Renderer>;
  let mockContext: Context;
  let mockNunjucksEnv: jest.Mocked<nunjucks.Environment>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Renderer instance
    mockRenderer = {
      transform: jest.fn(),
      getNunjucksPaths: jest.fn(() => ['/default/path']), // Always return a default path
    } as unknown as jest.Mocked<Renderer>;

    // Mock renderer function
    mockRendererFunc = jest.fn(() => mockRenderer);

    // Mock Nunjucks environment
    mockNunjucksEnv = {
      addFilter: jest.fn(),
    } as unknown as jest.Mocked<nunjucks.Environment>;

    // Mock nunjucks.configure
    (nunjucks.configure as jest.Mock).mockReturnValue(mockNunjucksEnv);
    (nunjucks.render as jest.Mock).mockReturnValue('<html>rendered page</html>');

    // Mock i18next
    (i18next.init as jest.Mock).mockReturnValue(undefined);
    (i18next.t as unknown as jest.Mock).mockImplementation((key) => `translated_${key}`);

    // Create test instance
    renderControl = new RenderControl(mockRendererFunc);

    // Mock context with simplified typing
    mockContext = {
      allElements: [],
      page: {
        id: 'test-page',
        elements: [],
        nextPage: null,
        error: undefined,
      },
      service: {
        name: 'test-service',
        selectedLang: 'en',
        defaultLang: 'en',
        i18n: {
          default: 'en',
          resources: {
            en: {
              custom: {
                key: 'Custom value',
              },
            },
          },
        },
        footer: null,
      },
    } as unknown as Context;
  });

  describe('constructor', () => {
    it('should create RenderControl with renderer function', () => {
      const testRendererFunc = jest.fn();
      const control = new RenderControl(testRendererFunc);

      expect(control).toBeInstanceOf(RenderControl);
    });
  });

  describe('renderDocument', () => {
    beforeEach(() => {
      mockRenderer.getNunjucksPaths.mockReturnValue(['/test/path1', '/test/path2']);
    });

    it('should render document with no elements', () => {
      const result = renderControl.renderDocument(mockContext);

      expect(mockRendererFunc).toHaveBeenCalledWith(mockContext);
      expect(mockRenderer.getNunjucksPaths).toHaveBeenCalled();
      expect(nunjucks.render).toHaveBeenCalledWith('Page.njk', mockContext);
      expect(result).toBe('<html>rendered page</html>');
    });

    it('should transform all elements in context', () => {
      const testElements = [
        { type: 'Text', context: undefined, transformed: undefined } as Element,
        { type: 'Input', context: undefined, transformed: undefined } as Element,
        { type: 'Button', context: undefined, transformed: undefined } as Element,
      ];

      mockContext.allElements = testElements;
      mockRenderer.transform.mockReturnValue('transformed');

      renderControl.renderDocument(mockContext);

      expect(mockRenderer.transform).toHaveBeenCalledTimes(3);
      testElements.forEach((element) => {
        expect(mockRenderer.transform).toHaveBeenCalledWith(element, mockNunjucksEnv);
        expect(element.context).toBe(mockContext);
        expect(element.transformed).toBe('transformed');
      });
    });

    it('should transform page error element when present', () => {
      const errorElement = { type: 'Error', message: 'Test error' };
      (mockContext.page as any).error = errorElement;
      mockRenderer.transform.mockReturnValue('error transformed');

      renderControl.renderDocument(mockContext);

      expect(mockRenderer.transform).toHaveBeenCalledWith(errorElement, mockNunjucksEnv);
    });

    it('should not transform page error when undefined', () => {
      (mockContext.page as any).error = undefined;

      renderControl.renderDocument(mockContext);

      // Only called for elements, not for error
      expect(mockRenderer.transform).toHaveBeenCalledTimes(0);
    });

    it('should transform footer when present', () => {
      const footer = { content: 'Footer content' } as any;
      (mockContext.service as any).footer = footer;
      mockRenderer.transform.mockReturnValue('footer transformed');

      renderControl.renderDocument(mockContext);

      expect(footer.type).toBe('Footer');
      expect(mockRenderer.transform).toHaveBeenCalledWith(footer, mockNunjucksEnv);
      expect(footer.transformed).toBe('footer transformed');
    });

    it('should not transform footer when null', () => {
      (mockContext.service as any).footer = null;

      renderControl.renderDocument(mockContext);

      // Footer transformation should not be called
      expect(mockRenderer.transform).toHaveBeenCalledTimes(0);
    });

    it('should configure nunjucks environment correctly', () => {
      const testPaths = ['/custom/path1', '/custom/path2'];
      mockRenderer.getNunjucksPaths.mockReturnValue(testPaths);

      renderControl.renderDocument(mockContext);

      expect(nunjucks.configure).toHaveBeenCalledWith(testPaths, {
        autoescape: false,
        trimBlocks: true,
        lstripBlocks: true,
      });
    });

    it('should initialize i18next with correct configuration', () => {
      renderControl.renderDocument(mockContext);

      expect(i18next.init).toHaveBeenCalledWith({
        initAsync: false,
        lng: 'en',
        fallbackLng: 'en',
        resources: expect.objectContaining({
          en: expect.objectContaining({
            test: { message: 'Test message' },
            custom: { key: 'Custom value' },
          }),
        }),
      });
    });

    it('should add translation filter to nunjucks environment', () => {
      renderControl.renderDocument(mockContext);

      expect(mockNunjucksEnv.addFilter).toHaveBeenCalledWith('trans', expect.any(Function));
    });

    it('should handle multiple renderer calls correctly', () => {
      // First call
      renderControl.renderDocument(mockContext);
      expect(mockRendererFunc).toHaveBeenCalledTimes(2); // Once for main renderer, once for configureNunjucks

      // Second call should also work
      jest.clearAllMocks();
      renderControl.renderDocument(mockContext);
      expect(mockRendererFunc).toHaveBeenCalledTimes(2);
    });
  });

  describe('configureNunjucks (tested through renderDocument)', () => {
    it('should merge static and service translations', () => {
      (mockContext.service as any).i18n = {
        default: 'en',
        resources: {
          en: {
            service: { key: 'Service value' },
          },
          fr: {
            service: { key: 'Valeur du service' },
          },
        },
      };

      renderControl.renderDocument(mockContext);

      expect(i18next.init).toHaveBeenCalledWith(
        expect.objectContaining({
          resources: expect.objectContaining({
            en: expect.objectContaining({
              test: { message: 'Test message' },
              service: { key: 'Service value' },
            }),
            fr: expect.objectContaining({
              service: { key: 'Valeur du service' },
            }),
          }),
        }),
      );
    });

    it('should handle missing i18n resources in service', () => {
      (mockContext.service as any).i18n = undefined;

      renderControl.renderDocument(mockContext);

      expect(i18next.init).toHaveBeenCalledWith(
        expect.objectContaining({
          resources: expect.objectContaining({
            en: expect.objectContaining({
              test: { message: 'Test message' },
            }),
          }),
        }),
      );
    });

    it('should use different language settings', () => {
      (mockContext.service as any).selectedLang = 'fr';
      (mockContext.service as any).defaultLang = 'en';

      renderControl.renderDocument(mockContext);

      expect(i18next.init).toHaveBeenCalledWith(
        expect.objectContaining({
          lng: 'fr',
          fallbackLng: 'en',
        }),
      );
    });

    it('should accumulate nunjucks paths across multiple calls', () => {
      const firstPaths = ['/path1', '/path2'];
      const secondPaths = ['/path3', '/path4'];

      mockRenderer.getNunjucksPaths.mockReturnValueOnce(firstPaths);
      renderControl.renderDocument(mockContext as Context);

      expect(nunjucks.configure).toHaveBeenCalledWith(firstPaths, expect.any(Object));

      mockRenderer.getNunjucksPaths.mockReturnValueOnce(secondPaths);
      renderControl.renderDocument(mockContext as Context);

      // Second call should have accumulated paths
      expect(nunjucks.configure).toHaveBeenLastCalledWith([...secondPaths, ...firstPaths], expect.any(Object));
    });
  });

  describe('translation filter', () => {
    it('should create working translation filter', () => {
      renderControl.renderDocument(mockContext as Context);

      // Get the filter function that was passed to addFilter
      const filterCall = mockNunjucksEnv.addFilter.mock.calls.find((call) => call[0] === 'trans');
      expect(filterCall).toBeDefined();

      const translationFilter = filterCall![1];

      // Test the filter function
      const result = translationFilter('test.key', { param: 'value' });

      expect(i18next.t).toHaveBeenCalledWith('test.key', { param: 'value' });
      expect(result).toBe('translated_test.key');
    });

    it('should handle translation filter without parameters', () => {
      renderControl.renderDocument(mockContext);

      const filterCall = mockNunjucksEnv.addFilter.mock.calls.find((call) => call[0] === 'trans');
      const translationFilter = filterCall![1];

      const result = translationFilter('simple.key');

      expect(i18next.t).toHaveBeenCalledWith('simple.key', {});
      expect(result).toBe('translated_simple.key');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex rendering scenario with all features', () => {
      const complexElements = [
        { type: 'Form', context: undefined, transformed: undefined } as Element,
        { type: 'Input', context: undefined, transformed: undefined } as Element,
      ];
      const errorElement = { type: 'ValidationError', message: 'Invalid input' };
      const footer = { content: 'Copyright 2024' } as any;

      mockContext.allElements = complexElements;
      (mockContext.page as any).error = errorElement;
      (mockContext.service as any).footer = footer;
      (mockContext.service as any).i18n = {
        default: 'en',
        resources: {
          en: { form: { submit: 'Submit' } },
          fr: { form: { submit: 'Soumettre' } },
        },
      };

      mockRenderer.getNunjucksPaths.mockReturnValue(['/templates']);
      mockRenderer.transform.mockReturnValue('mock-transformed');

      const result = renderControl.renderDocument(mockContext);

      // Verify all elements were processed
      expect(mockRenderer.transform).toHaveBeenCalledTimes(4); // 2 elements + error + footer
      expect(complexElements[0].context).toBe(mockContext);
      expect(complexElements[1].context).toBe(mockContext);
      expect(footer.type).toBe('Footer');
      expect(result).toBe('<html>rendered page</html>');
    });
  });

  describe('error handling', () => {
    it('should handle renderer function throwing error', () => {
      mockRendererFunc.mockImplementation(() => {
        throw new Error('Renderer creation failed');
      });

      expect(() => {
        renderControl.renderDocument(mockContext);
      }).toThrow('Renderer creation failed');
    });

    it('should handle nunjucks.render throwing error', () => {
      (nunjucks.render as jest.Mock).mockImplementation(() => {
        throw new Error('Template rendering failed');
      });

      expect(() => {
        renderControl.renderDocument(mockContext);
      }).toThrow('Template rendering failed');
    });

    it('should handle transform throwing error for elements', () => {
      const element = { type: 'Test', context: undefined, transformed: undefined } as Element;
      mockContext.allElements = [element];

      mockRenderer.transform.mockImplementation(() => {
        throw new Error('Transform failed');
      });

      expect(() => {
        renderControl.renderDocument(mockContext);
      }).toThrow('Transform failed');
    });
  });
});
