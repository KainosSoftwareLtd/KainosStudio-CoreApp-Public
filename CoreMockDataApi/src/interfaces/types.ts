/**
 * Mirrors the DataRetrievalRequest from CoreRuntime (extended with sessionData).
 */
export interface DataRetrievalRequest {
  /** Authenticated user id from SAML/JWT — forwarded as-is. */
  userId?: string;
  /** Field names that need to be populated. */
  fields: string[];
  /** Current form session data — used for session-aware conditional logic. */
  sessionData?: Record<string, string>;
}

/**
 * Structured response returned to DataRetrievalService.
 */
export interface DataRetrievalResponse {
  /** Scalar field values, keyed by field name. */
  values: Record<string, string>;
  /**
   * Option lists for multi-value fields (SelectListField, RadioField, CheckboxField).
   * Omitted when no requested field has a dynamic options list.
   */
  options?: Record<string, FieldOption[]>;
}

/** A single option item for a SelectListField, RadioField, or CheckboxField. */
export interface FieldOption {
  /** The display label shown to the user. Required. */
  text: string;
  /** The submitted value. Defaults to `text` when omitted. */
  value?: string;
  /** Secondary display value (design-system specific). */
  valueText?: string;
  /** Hint text shown beneath the option. */
  hint?: string;
}

/**
 * Entry in the CONDITIONAL_OPTIONS map.
 * Allows option lists and default values to be derived from current session state.
 */
export interface ConditionalOptionsEntry {
  /** Returns the appropriate options list given the current session data. */
  optionsFn: (sessionData: Record<string, string>) => FieldOption[];
  /** Optionally returns a pre-selected value derived from session data. */
  defaultValueFn?: (sessionData: Record<string, string>) => string | undefined;
}
