import type { ConditionalOptionsEntry, FieldOption } from '../interfaces/types.js';

/**
 * Static scalar values, keyed by exact field name.
 *
 * Used for simple text-like fields (TextField, EmailField, PhoneNumberField, etc.).
 * Add entries here for any field names used in demo forms.
 */
export const SCALAR_VALUES: Record<string, string> = {
  // Personal
  firstName: 'Jane',
  lastName: 'Smith',
  fullName: 'Jane Smith',
  title: 'Ms',
  'dateOfBirth-day': '01',
  'dateOfBirth-month': '06',
  'dateOfBirth-year': '1990',
  'applicantDateOfBirth-day': '15',
  'applicantDateOfBirth-month': '03',
  'applicantDateOfBirth-year': '1985',
  email: 'jane.smith@example.com',
  phoneNumber: '07700 900000',
  nationalInsuranceNumber: 'AB123456C',

  // Address sub-fields
  'address-line1': '10 Downing Street',
  'address-line2': '',
  'address-town': 'London',
  'address-county': 'Greater London',
  'address-postcode': 'SW1A 2AA',
  'applicantAddress-line1': '42 Kainos Way',
  'applicantAddress-line2': 'Titanic Quarter',
  'applicantAddress-town': 'Belfast',
  'applicantAddress-county': 'County Antrim',
  'applicantAddress-postcode': 'BT3 9DT',

  // Organisation
  organisationName: 'Acme Ltd',
  jobTitle: 'Software Engineer',
  department: 'Engineering',

  // Pre-selected values for option fields
  // (these are overridden by CONDITIONAL_OPTIONS when session state is relevant)
  country: 'GB',
  region: 'england',
  gender: 'prefer-not-to-say',
  employmentStatus: 'employed',
  preferredContact: 'email',

  // Demo: vehicle category selected on page 1 (drives subcategory options on page 2)
  vehicleCategory: 'bus-coach',
};

/**
 * Static option lists, keyed by exact field name.
 *
 * Used for SelectListField, RadioField, and CheckboxField where the available
 * options are fixed regardless of any earlier answers.
 *
 * For option lists that depend on an earlier answer, use CONDITIONAL_OPTIONS instead.
 */
export const OPTIONS_MAP: Record<string, FieldOption[]> = {
  country: [
    { text: 'United Kingdom', value: 'GB' },
    { text: 'Ireland', value: 'IE' },
    { text: 'France', value: 'FR' },
    { text: 'Germany', value: 'DE' },
    { text: 'Spain', value: 'ES' },
  ],

  gender: [
    { text: 'Male', value: 'male' },
    { text: 'Female', value: 'female' },
    { text: 'Non-binary', value: 'non-binary' },
    { text: 'Prefer not to say', value: 'prefer-not-to-say' },
  ],

  employmentStatus: [
    { text: 'Employed', value: 'employed' },
    { text: 'Self-employed', value: 'self-employed' },
    { text: 'Unemployed', value: 'unemployed' },
    { text: 'Student', value: 'student' },
    { text: 'Retired', value: 'retired' },
  ],

  preferredContact: [
    { text: 'Email', value: 'email' },
    { text: 'Phone', value: 'phone' },
    { text: 'Post', value: 'post' },
  ],

  interests: [
    { text: 'Technology', value: 'technology' },
    { text: 'Sport', value: 'sport' },
    { text: 'Music', value: 'music' },
    { text: 'Travel', value: 'travel' },
  ],
};

/**
 * Session-aware conditional options, keyed by field name.
 *
 * Each entry's `optionsFn` receives the full current session data and returns
 * the appropriate FieldOption list. `defaultValueFn` (optional) returns the
 * pre-selected scalar value, also derived from session state.
 *
 * To add a new demo use-case (e.g. department dropdown driven by an earlier
 * organisation selection), add a new entry here — no other files need changing.
 */
export const CONDITIONAL_OPTIONS: Record<string, ConditionalOptionsEntry> = {
  /**
   * Demo use-case: vehicleCategory (page 1) drives the vehicleSubcategory radio options (page 2).
   *
   * How to test:
   *   POST /retrieve  { "fields": ["vehicleSubcategory"], "sessionData": { "vehicleCategory": "bus-coach" } }
   *   → returns Single Deck, Double Deck, Articulated options
   *
   *   POST /retrieve  { "fields": ["vehicleSubcategory"], "sessionData": { "vehicleCategory": "minibus" } }
   *   → returns 9-16 Seats, 17+ Seats options
   */
  vehicleSubcategory: {
    optionsFn: (sessionData) => {
      switch (sessionData['vehicleCategory']) {
        case 'bus-coach':
          return [
            { text: 'Single Deck Bus', value: 'single-deck' },
            { text: 'Double Deck Bus', value: 'double-deck' },
            { text: 'Articulated Bus', value: 'articulated' },
            { text: 'Coach', value: 'coach' },
          ];
        case 'minibus':
          return [
            { text: '9–16 seats', value: 'minibus-small' },
            { text: '17+ seats', value: 'minibus-large' },
          ];
        case 'taxi-private-hire':
          return [
            { text: 'Hackney Carriage (Black Cab)', value: 'hackney' },
            { text: 'Private Hire Vehicle', value: 'phv' },
            { text: 'Executive / Limousine', value: 'executive' },
          ];
        default:
          return [
            { text: 'Standard', value: 'standard' },
            { text: 'Other', value: 'other' },
          ];
      }
    },
    defaultValueFn: (sessionData) => {
      switch (sessionData['vehicleCategory']) {
        case 'bus-coach':       return 'single-deck';
        case 'minibus':         return 'minibus-small';
        case 'taxi-private-hire': return 'hackney';
        default:                return 'standard';
      }
    },
  },

  /**
   * Demo use-case: country (page 1) drives the available regions (page 2).
   *
   * How to test:
   *   POST /retrieve  { "fields": ["region"], "sessionData": { "country": "GB" } }
   *   → returns four UK nations in options.region
   *
   *   POST /retrieve  { "fields": ["region"], "sessionData": { "country": "IE" } }
   *   → returns four Irish provinces in options.region
   */
  region: {
    optionsFn: (sessionData) => {
      switch (sessionData['country']) {
        case 'GB':
          return [
            { text: 'England', value: 'england' },
            { text: 'Scotland', value: 'scotland' },
            { text: 'Wales', value: 'wales' },
            { text: 'Northern Ireland', value: 'northern-ireland' },
          ];
        case 'IE':
          return [
            { text: 'Leinster', value: 'leinster' },
            { text: 'Munster', value: 'munster' },
            { text: 'Connacht', value: 'connacht' },
            { text: 'Ulster', value: 'ulster' },
          ];
        case 'FR':
          return [
            { text: 'Île-de-France', value: 'ile-de-france' },
            { text: 'Occitanie', value: 'occitanie' },
            { text: 'Nouvelle-Aquitaine', value: 'nouvelle-aquitaine' },
            { text: 'Auvergne-Rhône-Alpes', value: 'auvergne-rhone-alpes' },
          ];
        default:
          return [
            { text: 'Region A', value: 'region-a' },
            { text: 'Region B', value: 'region-b' },
          ];
      }
    },
    defaultValueFn: (sessionData) => {
      switch (sessionData['country']) {
        case 'GB': return 'england';
        case 'IE': return 'leinster';
        case 'FR': return 'ile-de-france';
        default:   return 'region-a';
      }
    },
  },
};
