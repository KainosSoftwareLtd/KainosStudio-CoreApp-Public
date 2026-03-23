# CoreMockDataApi

A standalone Node.js Lambda that implements the Data Retrieval API contract. It returns hardcoded mock values and dynamic option lists for form fields, enabling end-to-end demonstration of data pre-population without a real client back-end.

When a client is ready to integrate their own data source, they replace this service with their own implementation of the same contract.

---

## How it works

When a form page loads, the CoreDeployable runtime calls this API with a list of empty field names and the current session data. The mock API responds with:

- **`values`** — pre-populated scalar values for text, date, and address fields
- **`options`** — dynamic option lists for radio buttons, dropdowns, and checkboxes

Option lists can vary based on earlier answers. For example, selecting a vehicle category on page 1 determines which vehicle type options appear on page 2.

See [docs/mock-data-retrieval-api-spec.md](../docs/mock-data-retrieval-api-spec.md) for the full API contract.

---

## Running locally

### Prerequisites

- Node.js (LTS version recommended)
- npm

### Install and start

```bash
cd CoreMockDataApi
npm install
npm start
```

The API starts on **port 3003** by default.

### Environment variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3003` |
| `LOG_LEVEL` | Log verbosity (`debug` / `info` / `warn` / `error`) | `info` |

Create a `.env` file in the `CoreMockDataApi` folder to set these locally.

---

## Endpoints

### `POST /retrieve`

Accepts a list of field names and current session data; returns mock values and option lists.

**Request body:**
```json
{
  "fields": ["firstName", "vehicleSubcategory"],
  "sessionData": { "vehicleCategory": "bus-coach" },
  "userId": "optional-user-id"
}
```

**Response:**
```json
{
  "values": {
    "firstName": "Jane",
    "vehicleSubcategory": "single-deck"
  },
  "options": {
    "vehicleSubcategory": [
      { "text": "Single Deck Bus", "value": "single-deck" },
      { "text": "Double Deck Bus", "value": "double-deck" },
      { "text": "Articulated Bus", "value": "articulated" },
      { "text": "Coach",           "value": "coach" }
    ]
  }
}
```

### `GET /health`

Returns `{ "status": "ok" }`. Useful for smoke testing after deployment.

---

## Adding mock data

All hardcoded values live in [`src/data/mockData.ts`](src/data/mockData.ts):

| Export | Purpose |
|---|---|
| `SCALAR_VALUES` | Static strings keyed by exact field name — used for text, date sub-fields, address sub-fields, etc. |
| `OPTIONS_MAP` | Fixed option lists for fields whose options never change (e.g. gender, employment status) |
| `CONDITIONAL_OPTIONS` | Session-aware option lists — `optionsFn(sessionData)` returns different options based on earlier answers |

### Adding a new scalar field

Add an entry to `SCALAR_VALUES`:
```typescript
'myFieldName': 'Mock value here',
```

### Adding a static options field

Add an entry to `OPTIONS_MAP`:
```typescript
'mySelectField': [
  { text: 'Option A', value: 'a' },
  { text: 'Option B', value: 'b' },
],
```

### Adding a session-driven options field

Add an entry to `CONDITIONAL_OPTIONS`:
```typescript
'myDependentField': {
  optionsFn: (sessionData) => {
    switch (sessionData['myEarlierField']) {
      case 'value-a': return [{ text: 'Result 1', value: 'r1' }];
      default:        return [{ text: 'Default',  value: 'default' }];
    }
  },
  defaultValueFn: (sessionData) => {
    return sessionData['myEarlierField'] === 'value-a' ? 'r1' : 'default';
  },
},
```

After editing `mockData.ts`, run `npm run build` then restart the server.

---

## Building

```bash
npm run build
```

Compiled output goes to `lib/`. The `lib/lambda.js` handler is the AWS Lambda entry point.

---

## Deploying to AWS Lambda

| Setting | Value |
|---|---|
| Runtime | `nodejs22.x` |
| Handler | `lib/lambda.handler` |
| Memory | 256 MB |
| Timeout | 5 seconds |
| Trigger | API Gateway HTTP API (`POST /retrieve`, `GET /health`) |

Point the form's `dataRetrievalUrl` at the API Gateway invoke URL — see the CoreDeployable [Data Retrieval](#) section for details.
