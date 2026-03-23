# Mock Data Retrieval API — Technical Specification

## 1. Overview

The Mock Data Retrieval API is a standalone Node.js AWS Lambda that fulfils the `DataRetrievalService` contract. Its purpose is to enable end-to-end demonstrations of forms that require pre-populated field values and dynamic option lists (dropdowns, radio buttons, checkboxes) without integrating against a real client back-end.

When a real client deploys the full system, they replace this Lambda with their own data retrieval service; the contract described here remains identical.

---

## 2. Context & Current Architecture

The `DataRetrievalService` (in `CoreRuntime`) intercepts every page GET/POST request. Before a page is rendered it:

1. Inspects all `ValueElement` fields on the current page.
2. Identifies which fields are **empty** in the current session data.
3. POSTs the list of empty field names to a configurable `dataRetrievalUrl`.
4. Merges the API response back into the session data object, so fields have values when the template renders.

The `dataRetrievalUrl` is set on the `Service` definition (the form's JSON config file). It is optional; if omitted, data enrichment is skipped.

### 2.1 Current request / response types (CoreRuntime)

```typescript
// DataRetrievalService.ts
export interface DataRetrievalRequest {
  userId?: string;   // SAML/JWT user id when the user is authenticated
  fields: string[];  // Names of the empty fields to populate
}

export interface DataRetrievalResponse extends Record<string, unknown> {
  [key: string]: unknown; // flat map — key is field name, value is the populated value
}
```

The service currently merges the flat response object directly into `data` via `Object.assign(data, responseData)`.

---

## 3. Required Protocol Extensions

The current protocol only supports populating **scalar values** (text, dates, addresses). Two extensions are needed:

1. **Session data forwarding** — the request must include the current session data so the mock API can use answers from earlier pages to drive conditional option lists.
2. **Dynamic options** — the response must be able to carry option lists (for `SelectListField`, `RadioField`, `CheckboxField`) in addition to scalar values.

### 3.1 Extended request shape

```typescript
export interface DataRetrievalRequest {
  userId?: string;
  fields: string[];
  sessionData?: Record<string, string>; // NEW — all current form data from session
}
```

The `sessionData` map mirrors `FormSession.form_data` exactly — keys are field names, values are the user's previously submitted answers (or values already populated by an earlier data retrieval call).

> **Runtime change required:** `ContextBuilder` passes the `data` object to `DataRetrievalService.enrichData()`. The service must forward it as `sessionData` in the outbound request body.

### 3.2 Extended response shape

```typescript
export interface DataRetrievalResponse {
  values: Record<string, string>;
  options?: Record<string, FieldOption[]>;
}

export interface FieldOption {
  text: string;        // The display label (required)
  value?: string;      // The submitted value (defaults to text if omitted)
  valueText?: string;  // A secondary display value (optional, design-system specific)
  hint?: string;       // Hint text shown beneath the option
}
```

This is a **structured replacement** for the current flat `Record<string, unknown>` response. The `DataRetrievalService` must be updated to handle both the legacy flat shape (backward compatibility) and this new shape.

> **Runtime change required:** After receiving the response, `DataRetrievalService` must:
> - Apply `response.values` to `data` (replacing the current `Object.assign(data, responseData)`).
> - Apply `response.options[fieldName]` to the matching `FixedOptionValueElement.options` array on `allElements`, so that option lists are live before the template renders.

---

## 4. Mock API — Functional Requirements

### 4.1 Goal

For each field name in `request.fields`, the mock API must return:

| Field category | What to return |
|---|---|
| Simple scalar field | A plausible hardcoded string value keyed by field name |
| `SelectListField` / `RadioField` | A hardcoded default value **and** a hardcoded options array in `response.options` |
| `CheckboxField` | A hardcoded comma-separated value string **and** a hardcoded options array in `response.options` |
| `DatePickerField` sub-fields (`-day`, `-month`, `-year`) | Individual string values per sub-field |
| `AddressField` sub-fields (`-line1`, `-line2`, `-town`, `-county`, `-postcode`) | Individual string values per sub-field |

The mock API **does not** need to know the field types from the schema. It derives what to return purely from the field name (by convention) or from a static lookup map.

### 4.2 Session-aware conditional options

When `sessionData` is included in the request, the mock API can inspect earlier answers and return a different options list based on them. This models the real-world scenario where a back-end service tailors a dropdown to a previous selection.

**Example:** A form collects a country on page 1 (`country` field) and a region on page 2 (`region` field). The mock API checks `sessionData.country` and returns a region list specific to that country.

This logic must be explicitly implemented per demo use-case (see §6).

---

## 5. Mock API — Technical Design

### 5.1 Lambda structure

```
mock-data-retrieval-api/
├── src/
│   ├── handler.ts          # Lambda entry point
│   ├── router.ts           # Route the POST /retrieve request
│   ├── fieldResolver.ts    # Core resolution logic
│   ├── mockData.ts         # Hardcoded values and options lookup maps
│   └── types.ts            # Shared TypeScript types (mirrors CoreRuntime contracts)
├── package.json
├── tsconfig.json
└── template.yaml           # AWS SAM / CDK deployment descriptor (optional)
```

### 5.2 Lambda handler

The Lambda sits behind an API Gateway (HTTP API or REST API). It exposes a single endpoint:

```
POST /retrieve
Content-Type: application/json
```

The Lambda handler uses the `@vendia/serverless-express` adapter (or equivalent) to allow an Express app to be re-used locally and as a Lambda.

```typescript
// handler.ts
import serverless from '@vendia/serverless-express';
import { app } from './router.js';

export const handler = serverless({ app });
```

### 5.3 Router

```typescript
// router.ts
import express from 'express';
import { resolveFields } from './fieldResolver.js';
import type { DataRetrievalRequest, DataRetrievalResponse } from './types.js';

export const app = express();
app.use(express.json());

app.post('/retrieve', (req, res) => {
  const body = req.body as DataRetrievalRequest;

  if (!body?.fields || !Array.isArray(body.fields)) {
    return res.status(400).json({ error: '`fields` array is required' });
  }

  const response: DataRetrievalResponse = resolveFields(body.fields, body.sessionData);
  return res.status(200).json(response);
});

// Health check (useful for smoke tests and load balancer checks)
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
```

### 5.4 Field resolver

```typescript
// fieldResolver.ts
import { SCALAR_VALUES, OPTIONS_MAP, CONDITIONAL_OPTIONS } from './mockData.js';
import type { DataRetrievalResponse, FieldOption } from './types.js';

export function resolveFields(
  fields: string[],
  sessionData: Record<string, string> = {},
): DataRetrievalResponse {
  const values: Record<string, string> = {};
  const options: Record<string, FieldOption[]> = {};

  for (const field of fields) {
    // 1. Resolve the scalar value
    values[field] = resolveValue(field, sessionData);

    // 2. Resolve options if this field has a known options map
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

function resolveValue(
  field: string,
  sessionData: Record<string, string>,
): string {
  // Check session-aware conditional overrides first
  const conditionalValue = CONDITIONAL_OPTIONS[field]?.defaultValueFn?.(sessionData);
  if (conditionalValue !== undefined) return conditionalValue;

  // Fall back to the static scalar lookup, then a generic placeholder
  return SCALAR_VALUES[field] ?? deriveGenericValue(field);
}

function resolveOptions(
  field: string,
  sessionData: Record<string, string>,
): FieldOption[] | undefined {
  // Session-aware options take priority
  const conditionalEntry = CONDITIONAL_OPTIONS[field];
  if (conditionalEntry) {
    return conditionalEntry.optionsFn(sessionData);
  }

  // Static options list
  return OPTIONS_MAP[field];
}

/**
 * For fields with no explicit mapping, derive a sensible placeholder
 * based on common field name suffixes.
 */
function deriveGenericValue(field: string): string {
  if (field.endsWith('-day'))      return '01';
  if (field.endsWith('-month'))    return '06';
  if (field.endsWith('-year'))     return '1990';
  if (field.endsWith('-line1'))    return '10 Downing Street';
  if (field.endsWith('-line2'))    return '';
  if (field.endsWith('-town'))     return 'London';
  if (field.endsWith('-county'))   return 'Greater London';
  if (field.endsWith('-postcode')) return 'SW1A 2AA';

  // Generic text placeholder as a last resort
  return `mock-${field}`;
}
```

### 5.5 Mock data store

```typescript
// mockData.ts
import type { FieldOption, ConditionalOptionsEntry } from './types.js';

/**
 * Static scalar values, keyed by exact field name.
 * Used for simple text-like fields (TextField, EmailField, etc.).
 */
export const SCALAR_VALUES: Record<string, string> = {
  // Personal
  'firstName':        'Jane',
  'lastName':         'Smith',
  'fullName':         'Jane Smith',
  'dateOfBirth':      '01/06/1990',
  'dateOfBirth-day':  '01',
  'dateOfBirth-month':'06',
  'dateOfBirth-year': '1990',
  'email':            'jane.smith@example.com',
  'phoneNumber':      '07700 900000',
  'nationalInsuranceNumber': 'AB123456C',

  // Address
  'address-line1':    '10 Downing Street',
  'address-line2':    '',
  'address-town':     'London',
  'address-county':   'Greater London',
  'address-postcode': 'SW1A 2AA',

  // Organisation
  'organisationName': 'Acme Ltd',
  'jobTitle':         'Software Engineer',
  'department':       'Engineering',

  // Default selected values for option fields (overridden by OPTIONS_MAP if needed)
  'country':          'GB',
  'region':           'england',
  'gender':           'prefer-not-to-say',
  'employmentStatus': 'employed',
  'preferredContact': 'email',
};

/**
 * Static option lists, keyed by exact field name.
 * Used for SelectListField, RadioField, and CheckboxField
 * where the options are the same regardless of session state.
 */
export const OPTIONS_MAP: Record<string, FieldOption[]> = {
  'country': [
    { text: 'United Kingdom', value: 'GB' },
    { text: 'Ireland',        value: 'IE' },
    { text: 'France',         value: 'FR' },
    { text: 'Germany',        value: 'DE' },
    { text: 'Spain',          value: 'ES' },
  ],

  'gender': [
    { text: 'Male',               value: 'male' },
    { text: 'Female',             value: 'female' },
    { text: 'Non-binary',         value: 'non-binary' },
    { text: 'Prefer not to say',  value: 'prefer-not-to-say' },
  ],

  'employmentStatus': [
    { text: 'Employed',          value: 'employed' },
    { text: 'Self-employed',     value: 'self-employed' },
    { text: 'Unemployed',        value: 'unemployed' },
    { text: 'Student',           value: 'student' },
    { text: 'Retired',           value: 'retired' },
  ],

  'preferredContact': [
    { text: 'Email',     value: 'email' },
    { text: 'Phone',     value: 'phone' },
    { text: 'Post',      value: 'post' },
  ],

  'interests': [
    { text: 'Technology', value: 'technology' },
    { text: 'Sport',      value: 'sport' },
    { text: 'Music',      value: 'music' },
    { text: 'Travel',     value: 'travel' },
  ],
};

/**
 * Session-aware conditional options, keyed by field name.
 *
 * `optionsFn` receives the full current session data and returns the
 * appropriate options list. `defaultValueFn` (optional) returns the
 * pre-selected value, also derived from session state.
 *
 * Extend this map for each demo use-case that requires cross-page
 * conditional data (e.g. country → region).
 */
export const CONDITIONAL_OPTIONS: Record<string, ConditionalOptionsEntry> = {
  'region': {
    optionsFn: (sessionData) => {
      switch (sessionData['country']) {
        case 'GB':
          return [
            { text: 'England',          value: 'england' },
            { text: 'Scotland',         value: 'scotland' },
            { text: 'Wales',            value: 'wales' },
            { text: 'Northern Ireland', value: 'northern-ireland' },
          ];
        case 'IE':
          return [
            { text: 'Leinster',  value: 'leinster' },
            { text: 'Munster',   value: 'munster' },
            { text: 'Connacht',  value: 'connacht' },
            { text: 'Ulster',    value: 'ulster' },
          ];
        default:
          return [
            { text: 'Region A', value: 'region-a' },
            { text: 'Region B', value: 'region-b' },
          ];
      }
    },
    defaultValueFn: (sessionData) => {
      // Pre-select 'england' whenever the country is GB
      return sessionData['country'] === 'GB' ? 'england' : 'region-a';
    },
  },
};
```

### 5.6 Types

```typescript
// types.ts

// Mirrors CoreRuntime DataRetrievalRequest (extended with sessionData)
export interface DataRetrievalRequest {
  userId?: string;
  fields: string[];
  sessionData?: Record<string, string>;
}

// New structured response (replaces flat Record<string, unknown>)
export interface DataRetrievalResponse {
  values: Record<string, string>;
  options?: Record<string, FieldOption[]>;
}

export interface FieldOption {
  text: string;
  value?: string;
  valueText?: string;
  hint?: string;
}

export interface ConditionalOptionsEntry {
  optionsFn: (sessionData: Record<string, string>) => FieldOption[];
  defaultValueFn?: (sessionData: Record<string, string>) => string | undefined;
}
```

---

## 6. Session-Aware Demo Use-Cases

These are the scenarios the mock API must support out of the box. Additional use-cases follow the same pattern and are added to `CONDITIONAL_OPTIONS` in `mockData.ts`.

| Field on page N | Depends on answer to | Behaviour |
|---|---|---|
| `region` (page 2) | `country` (page 1) | Returns regions specific to the selected country. Defaults to UK regions when no country is set. |

To add a new use-case:

1. Add an entry to `CONDITIONAL_OPTIONS` in `mockData.ts` with the target field name as the key.
2. Implement `optionsFn` to inspect `sessionData` and return the appropriate `FieldOption[]`.
3. Optionally implement `defaultValueFn` to pre-select a value.

---

## 7. Required Changes to CoreRuntime

Two targeted changes to `DataRetrievalService.ts` are required to support the extended protocol.

### 7.1 Forward session data in the request

```typescript
// Before
const requestData: DataRetrievalRequest = {
  ...(userId && { userId }),
  fields: propertiesToFill,
};

// After
const requestData: DataRetrievalRequest = {
  ...(userId && { userId }),
  fields: propertiesToFill,
  sessionData: data as Record<string, string>,
};
```

The `data` object is already available in `enrichData()` as a parameter.

### 7.2 Apply options from response

The `enrichData()` method signature should accept `allElements` (it already does) and apply any returned options to the matching `FixedOptionValueElement` instances.

```typescript
// After receiving the response:
const responseData = await this.makeRequest(externalUrl, requestData);

// Apply scalar values (existing behaviour, updated key)
if ('values' in responseData && typeof responseData.values === 'object') {
  Object.assign(data, responseData.values);
} else {
  // Backward-compat: response is still a flat map
  Object.assign(data, responseData);
}

// Apply dynamic options to elements
if ('options' in responseData && responseData.options) {
  for (const element of allElements) {
    const dynamicOptions = responseData.options[element.name];
    if (dynamicOptions && 'options' in element) {
      (element as FixedOptionValueElement).options = dynamicOptions;
    }
  }
}
```

`FixedOptionValueElement` is already imported in the element types file and its `options` property is writable.

---

## 8. Deployment

### 8.1 AWS Lambda configuration

| Setting | Value |
|---|---|
| Runtime | `nodejs22.x` |
| Handler | `dist/handler.handler` |
| Memory | 256 MB |
| Timeout | 5 seconds |
| Trigger | API Gateway HTTP API (POST /retrieve, GET /health) |

### 8.2 Environment variables

| Variable | Purpose | Example |
|---|---|---|
| `LOG_LEVEL` | Controls verbosity (`debug` / `info` / `warn` / `error`) | `info` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins (if accessed from browser) | `https://your-form-host.example.com` |

No database or external dependencies are required. All data is hardcoded.

### 8.3 Referencing the mock API from a form definition

Set `dataRetrievalUrl` in the service's JSON config to the API Gateway invoke URL:

```json
{
  "name": "My Demo Form",
  "firstPage": "PageOne",
  "dataRetrievalUrl": "https://<api-id>.execute-api.<region>.amazonaws.com/retrieve",
  "pages": [ ... ]
}
```

---

## 9. API Contract Reference

### POST /retrieve

#### Request

```json
{
  "userId": "user-123",
  "fields": ["firstName", "country", "region"],
  "sessionData": {
    "country": "GB"
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `fields` | `string[]` | Yes | Field names that need populating |
| `userId` | `string` | No | Authenticated user id from SAML/JWT |
| `sessionData` | `Record<string, string>` | No | Current form session data (all previously submitted/populated values) |

#### Response — 200 OK

```json
{
  "values": {
    "firstName": "Jane",
    "country": "GB",
    "region": "england"
  },
  "options": {
    "country": [
      { "text": "United Kingdom", "value": "GB" },
      { "text": "Ireland",        "value": "IE" }
    ],
    "region": [
      { "text": "England",          "value": "england" },
      { "text": "Scotland",         "value": "scotland" },
      { "text": "Wales",            "value": "wales" },
      { "text": "Northern Ireland", "value": "northern-ireland" }
    ]
  }
}
```

`options` is omitted from the response if no requested field has a dynamic options list.

#### Response — 400 Bad Request

```json
{ "error": "`fields` array is required" }
```

---

## 10. Testing

### Unit tests

- `fieldResolver.ts` — test each combination of scalar field, options field, and session-conditional options
- `mockData.ts` — verify `CONDITIONAL_OPTIONS` returns correct lists for each supported session state

### Integration / smoke tests

Run the Express app locally (without Lambda adapter) and POST test requests directly:

```bash
node dist/router.js &
curl -s -X POST http://localhost:3001/retrieve \
  -H 'Content-Type: application/json' \
  -d '{"fields":["firstName","region"],"sessionData":{"country":"GB"}}' | jq .
```

Expected: `values.firstName = "Jane"`, `options.region` contains the four UK nations.

---

## 11. Out of Scope

- Authentication/authorisation on the mock API itself (it is an internal demo service, not public-facing)
- Storing or persisting any data
- Mirroring a real client's backend schema
- Supporting the full OpenAPI / `apiMappings` submission flow (that is handled separately by the `apiServiceDefinition` on the `Service`)
