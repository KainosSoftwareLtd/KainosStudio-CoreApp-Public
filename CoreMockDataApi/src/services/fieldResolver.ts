import { CONDITIONAL_OPTIONS, OPTIONS_MAP, SCALAR_VALUES } from '../data/mockData.js';
import type { DataRetrievalResponse, FieldOption } from '../interfaces/types.js';

/**
 * Resolves mock values and option lists for the requested fields.
 *
 * Resolution order for scalar values:
 *   1. Session-aware conditional override (CONDITIONAL_OPTIONS[field].defaultValueFn)
 *   2. Static scalar lookup (SCALAR_VALUES[field])
 *   3. Generic derivation from field name suffix
 *
 * Resolution order for options:
 *   1. Session-aware conditional options (CONDITIONAL_OPTIONS[field].optionsFn)
 *   2. Static options map (OPTIONS_MAP[field])
 *   3. Not included in response
 */
export function resolveFields(
  fields: string[],
  sessionData: Record<string, string> = {},
): DataRetrievalResponse {
  const values: Record<string, string> = {};
  const options: Record<string, FieldOption[]> = {};

  for (const field of fields) {
    values[field] = resolveValue(field, sessionData);

    const fieldOptions = resolveOptions(field, sessionData);
    if (fieldOptions) {
      options[field] = fieldOptions;
    }
  }

  return {
    values,
    ...(Object.keys(options).length > 0 && { options }),
  };
}

function resolveValue(field: string, sessionData: Record<string, string>): string {
  const conditionalValue = CONDITIONAL_OPTIONS[field]?.defaultValueFn?.(sessionData);
  if (conditionalValue !== undefined) return conditionalValue;

  if (field in SCALAR_VALUES) return SCALAR_VALUES[field];

  return deriveGenericValue(field);
}

function resolveOptions(field: string, sessionData: Record<string, string>): FieldOption[] | undefined {
  const conditionalEntry = CONDITIONAL_OPTIONS[field];
  if (conditionalEntry) {
    return conditionalEntry.optionsFn(sessionData);
  }

  return OPTIONS_MAP[field];
}

/**
 * Derives a sensible placeholder for fields with no explicit mapping,
 * using common field name suffixes as hints.
 */
function deriveGenericValue(field: string): string {
  if (field.endsWith('-day')) return '01';
  if (field.endsWith('-month')) return '06';
  if (field.endsWith('-year')) return '1990';
  if (field.endsWith('-line1')) return '10 Downing Street';
  if (field.endsWith('-line2')) return '';
  if (field.endsWith('-town')) return 'London';
  if (field.endsWith('-county')) return 'Greater London';
  if (field.endsWith('-postcode')) return 'SW1A 2AA';

  return `mock-${field}`;
}
