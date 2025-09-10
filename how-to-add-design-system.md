# How to Add a New Design System

This guide explains how to fully implement a new design system in the project, including renderer integration, asset management, and custom element/page implementations.

## 1. Create a New Design System Package

- Create a new folder in the root directory (e.g., `FelcaNewDS/`).
- Add an `index.ts` file to export your renderer and other main components.
- Implement your design system's custom `Page` and `Element` templates in the `src/` directory.
- Add your CSS and JS assets to the `lib/assets` and `lib/public/<design-system>` folders.
- Create a `package.json` and `tsconfig.json` for the new package.

## 2. Implement the Renderer

- In your new package, create a renderer class (e.g., `NewDSRenderer`) that extends the base `Renderer` from `felca-runtime`.
- Implement the `getNunjucksPaths()` method to return paths to your design system's templates and assets.
- Implement the `transform()` method to handle element transformation using your design system's logic.
- Example:
  ```typescript
  export default class NewDSRenderer extends Renderer {
    getNunjucksPaths(): string[] {
      // Paths in which the templates you include will be searched usually own folder path and external package paths.
      //
      // For example we have {% from "govuk/components/date-input/macro.njk" import govukDateInput %} 
      // but this govuk template come from govuk-frontend package so instead of giving full path we have defined root folder for search e.g. node_modules/govuk-frontend/dist
      return ['node_modules/felca-newds/lib', 'node_modules/govuk-frontend/dist'];
    }
    public transform(element: Element, nunjucksEnv: NunjucksEnvironment): any {
      // Custom transformation logic
      // The transformer is used to prepare the base object by transforming it or performing additional actions on it, it is much simpler than doing it on the nunjucts template side 
      const transformer = new Transformer(nunjucksEnv);
      return transformer.transform(element);
    }
  }

  // example of Transformer
  export default class Transformer {
    private nunjucksEnv;
    private trans: (textId?: string, params?: any) => string;

    public constructor(nunjucksEnv: NunjucksEnvironment) {
      nunjucksEnv.addGlobal('govukRebrand', true);
      
      this.nunjucksEnv = nunjucksEnv;
      this.trans = nunjucksEnv.getFilter('trans');
    }

    public transform(element: Element): any {
      if ('Summary' === element.type) {
        // the returned value is also available in the template as part of the `transformed` property
        return this.transformSummary(element as Summary);
      }
    }

    private transformSummary(element: Summary): any {
      const rows = [];
      if (!element.summaryDataItems) element.summaryDataItems = [];
      for (const summaryDataItem of element.summaryDataItems) {
        rows.push({
          key: {
            text: this.trans(summaryDataItem.key),
          },
          value: {
            text: replaceHtmlSpecialChars(this.trans(summaryDataItem.value)),
          },
          actions: {
            items: [
              {
                href: summaryDataItem.link,
                text: this.trans(summaryDataItem.linkText),
                visuallyHiddenText: this.trans(summaryDataItem.key),
              },
            ],
          },
        });
      }
      return rows;
    }
  }
  ```

## 3. Register Static Asset Paths

- Export a function (e.g., `getLocalNewdsStaticPaths`) that returns an array of key-value pairs mapping URL paths to local asset directories.
- Example:
  ```typescript
  // Needed for local environment, for prod we are using files from s3 bucket cached on cloudfront
  export function getLocalNewdsStaticPaths() {
    return [
      { key: '/assets', value: 'node_modules/felca-newds/lib/assets' },
      { key: '/public/newds', value: 'node_modules/felca-newds/lib/public/newds' },
    ];
  }
  ```

## 4. Integrate the Renderer in the Main Switch

- In the main file where renderers are switched (e.g., `index.ts`), import your new renderer and add it to the switch logic.
- Ensure the switch can select your renderer based on the design system identifier.
- Example:
  ```typescript
  import NewDSRenderer from 'felca-newds/src/index';
  // ...existing code...
  switch (designSystem) {
    case 'newds':
      renderer = new NewDSRenderer();
      break;
    // ...other cases...
  }
  ```

## 5. Implement Elements and Pages

- We have types for `Elements` in FelcaRuntime, you can check the type names as well as all the properties available for that type.
  ```typescript
  // Example 
  export default class Panel implements Element {
    public type: string;
    public title: string;
    public text: string;
    public referenceNumber?: string;

    public constructor(title: string, text: string) {
      this.type = 'Panel';
      this.title = title;
      this.text = text;
    }
  }
  ```
- Create or update Nunjucks templates in your design system's template directory (e.g., `src/elements/TextField.njk`) to define the visual style for each element:
  ```html
  {% macro textField(elementData) %}
  {% set displayText = elementData.displayText | trans() %}

  <fieldset class="fieldset">
    <p class="label">{{ displayText }}</p>
    <input type="text" class="input" id="{{elementData.name}}" />
  </fieldset>
  {% endmacro %}
  ```
- (Optional) Update your `Transformer` class to mutate the element's data into the shape expected by the template:
  ```typescript
  // ...existing code...
  if (element.type === 'TextField') {
    element.error = element.validation.error;
  }
  // ...existing code...
  ```
- Preapare you main design system's template - `Page.njk`, include the element templates and pass the transformed data:
  ```html
  <!-- you can use templates from external packages like {% extends "govuk/template.njk" %} that prepare some structure for you -->
  <html>
  <head>Page title</head>
  <body>
    {% for element in elements %}
      {% if element.type == 'TextField' %}
        {% from "elements/TextField.njk" import textField %}
        {{ textField(element) }}
      {% endif %}
      {# ...other element types... #}
    {% endfor %}
  </body>
  </html>
  ```
- Make sure your CSS (`lib/assets/newds.css`) includes styles for your elements.

## 6. Test the Integration

- Build and run the project to verify your design system is selectable and renders correctly.
- Check that all assets load and custom elements/pages behave as expected.

## 7. Document Your Design System

- Update the README in your package folder with usage instructions and any special notes.

## Alternative: Customizing Your Design System with SCSS Variable Overrides

If your design system changes are mostly related to colors, spacing, or other style variables, you can use SCSS variable overrides instead of copying and editing all component files. This approach is efficient and maintainable.

### Steps:
1. **Create a custom SCSS file for your overrides**
   Define your custom variables before importing the main GOV.UK styles:
   ```scss
   // Override GOV.UK variables
   $govuk-brand-colour: #005eb8;
   $govuk-link-colour: #0072ce;
   $govuk-spacing-scale-2: 12px;
   // ...add more overrides as needed

   // Import GOV.UK styles
   @import '../../node_modules/govuk-frontend/dist/govuk/index';
   ```

2. **Add your own custom styles below the import if needed**
   ```scss
   .my-custom-class {
     margin: $govuk-spacing-scale-2;
     color: $govuk-brand-colour;
   }
   ```

3. **Find all available variables to override**
   - Search for `$` in the GOV.UK SCSS source files (especially in `settings/`, `core/`, and `components/`).
   - Use a command like:
     ```powershell
     Select-String -Path "node_modules/govuk-frontend/**/*.scss" -Pattern "^\s*\$"
     ```
   - Check the official documentation: https://frontend.design-system.service.gov.uk/sass-api-reference/