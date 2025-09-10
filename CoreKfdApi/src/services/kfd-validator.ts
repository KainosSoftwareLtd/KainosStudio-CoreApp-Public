/* eslint-disable @typescript-eslint/no-explicit-any */

import z from 'zod';

export function validateKfd(content: any): string[] {
  const conditionalNextPageSchema = z.object({
    rules: z
      .array(
        z.object({
          page: z
            .string()
            .nonempty()
            .refine(
              (page) => {
                return content.pages.some((p: { id: string }) => p.id === page);
              },
              {
                message: 'The page attribute in rule does not match any page in the service',
              }
            ),
          match: z.any().refine(
            (data) => {
              const hasAtLeastOneKey = Object.keys(data).length > 0;
              const allValuesAreNonEmptyStrings = Object.values(data).every((value) => typeof value === 'string' && value.length > 0);
              return hasAtLeastOneKey && allValuesAreNonEmptyStrings;
            },
            {
              message: 'Object must have at least one key with not empty string value',
            }
          ),
        })
      )
      .min(1),
  });

  const errors = [];
  for (const page of content.pages) {
    if (page.nextPage != null && typeof page.nextPage !== 'string') {
      const result = conditionalNextPageSchema.safeParse(page.nextPage);
      if (!result.success) {
        const schemaErrors = result.error.issues.map((issue) => issue.path.join('->') + ': ' + issue.message);
        errors.push(...schemaErrors);
        continue;
      }

      for (const rule of result.data.rules) {
        for (const entry of Object.entries(rule.match)) {
          const componentId = entry[0];
          const matchValue = String(entry[1]);
          const elementsWithId = findAllMatchesInArrayWithElements(content.pages, (item) => item.name === componentId);
          if (elementsWithId.length > 1) {
            errors.push(`There are more than one component with id ${componentId}`);
            continue;
          }

          if (elementsWithId.length === 1) {
            const element = elementsWithId[0];

            if (element.type === 'RadioField' || element.type === 'SelectListField') {
              const anyOptionHasMatchValue = element.options.some((o: { value: string }) => o.value === matchValue);
              if (!anyOptionHasMatchValue) {
                errors.push(`Any of the values in the ${element.type}: ${element.name} do not match ${matchValue} value in the rule`);
              }
            }

            const isMandatory = element?.validation?.isMandatory;
            if (!isMandatory) {
              errors.push(`Mandatory attribute for ${element.type}: ${element.name} is not set`);
            }
          } else {
            errors.push(`Missing component with id ${componentId} for conditional logic`);
          }
        }
      }
    }
  }

  return [...new Set(errors)];
}

const findAllMatchesInArrayWithElements = (array: any[], condition: (item: any) => boolean): any[] => {
  const matches: any[] = [];

  const search = (items: any[]) => {
    for (const item of items) {
      if (condition(item)) {
        matches.push(item);
      }
      if (item.elements) {
        search(item.elements);
      }
    }
  };

  search(array);
  return matches;
};
