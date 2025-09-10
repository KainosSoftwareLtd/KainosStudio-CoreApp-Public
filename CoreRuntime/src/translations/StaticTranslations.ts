import { Resource } from 'i18next';

export function getStaticTranslations(): Resource {
  const staticTranslations: Resource = {
    'en-GB': {
      core: {
        'default-mandatory-error': 'This is a mandatory field and cannot be blank',
        'cannot-be-blank-error': '{{for}} cannot be blank',
        summary: {
          'change-link-text': 'Change',
        },
        'back-button': {
          'link-text': 'Back',
        },
        'cookie-banner': {
          heading: 'Cookies on {{serviceName}}',
          content: 'We use some essential cookies to make this service work.',
          'hide-action-text': 'Hide cookie message',
          'view-cookies-action-text': 'View cookies',
        },
        footer: {
          'cookie-link-text': 'Cookies',
          copyright: '© Crown copyright',
          'content-licence':
            'All content is available under the <a class="govuk-footer__link" href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license">Open Government Licence v3.0</a>, except where otherwise stated',
          'ou-statement':
            '©2025. All rights reserved. The Open University is incorporated by Royal Charter (RC 000391), an exempt charity in England & Wales and a charity registered in Scotland (SC 038302). The Open University is authorised and regulated by the Financial Conduct Authority in relation to its secondary activity of credit broking.',
          links: {
            accessibility: 'Accessibility',
            'copyright-statement': 'Copyright statement',
            privacy: 'Privacy',
            'terms-and-conditions': 'Terms and conditions',
          },
        },
        'cookie-table': {
          'name-column': 'Name',
          'purpose-column': 'Purpose',
          'expires-column': 'Expires',
          'session-data-cookie': {
            purpose: 'Stores session data for the service',
            expires: '5 hours',
          },
        },
        'phone-number-input': {
          'invalid-error': 'Enter a phone number, like 01632 960 001, 07700 900 982 or +44 808 157 0192',
          'mandatory-error': 'Enter a phone number',
        },
        'email-input': {
          'invalid-error': 'Enter an email address in the correct format, like name@example.com',
          'mandatory-error': 'Enter an email address',
        },
        'date-input': {
          'mandatory-error': 'Enter {{for}}',
          'real-date-error': '{{for}} must be a real date',
          'missing-part-error': '{{for}} must include a real {{missingParts}}',
          'missing-part-concat-text': ' and ',
          day: {
            label: 'Day',
            'missing-part': 'day',
          },
          month: {
            label: 'Month',
            'missing-part': 'month',
          },
          year: {
            label: 'Year',
            'missing-part': 'year',
          },
        },
        address: {
          'county-input': {
            label: 'County (optional)',
          },
          'line1-input': {
            label: 'Address line 1',
            'invalid-error': 'Enter address line 1, typically the building and street',
          },
          'line2-input': {
            label: 'Address line 2 (optional)',
          },
          'postcode-input': {
            label: 'Postcode',
            'invalid-error': 'Enter a full UK postcode',
            'missing-error': 'Enter postcode',
            'mandatory-error': 'Enter postcode',
          },
          'town-input': {
            label: 'Town or city',
            'invalid-error': 'Enter town or city',
          },
        },
        'file-upload': {
          'select-file': 'Please select a file.',
          'file-is-empty': `The selected file is empty. Please choose a file that contains data and try again.`,
          'file-is-too-large': 'The selected file is too large. Please upload a file smaller than ',
          'file-type-is-unsupported': 'The selected file type is not supported.',
          uploading: 'Uploading… ',
          upload: 'Upload',
          'uploaded-file': 'Uploaded file: ',
          'api-error': 'Failed to get pre-signed URL: ',
        },
      },
    },
    'en-CA': {
      core: {
        'default-mandatory-error': 'This is a mandatory field and cannot be blank',
        'cannot-be-blank-error': '{{for}} cannot be blank',
        summary: {
          'change-link-text': 'Change',
        },
        'back-button': {
          'link-text': 'Back',
        },
        'cookie-banner': {
          heading: 'Cookies on {{serviceName}}',
          content: 'We use some essential cookies to make this service work.',
          'hide-action-text': 'Hide cookie message',
          'view-cookies-action-text': 'View cookies',
        },
        footer: {
          'cookie-link-text': 'Cookies',
          copyright: '© Crown copyright',
          'content-licence':
            'All content is available under the <a class="govuk-footer__link" href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license">Open Government Licence v3.0</a>, except where otherwise stated',
        },
        'cookie-table': {
          'name-column': 'Name',
          'purpose-column': 'Purpose',
          'expires-column': 'Expires',
          'session-data-cookie': {
            purpose: 'Stores session data for the service',
            expires: '5 hours',
          },
        },
        'phone-number-input': {
          'invalid-error': 'Enter a phone number, like 01632 960 001, 07700 900 982 or +44 808 157 0192',
          'mandatory-error': 'Enter a phone number',
        },
        'email-input': {
          'invalid-error': 'Enter an email address in the correct format, like name@example.com',
          'mandatory-error': 'Enter an email address',
        },
        'date-input': {
          'mandatory-error': 'Enter {{for}}',
          'real-date-error': '{{for}} must be a real date',
          'missing-part-error': '{{for}} must include a real {{missingParts}}',
          'missing-part-concat-text': ' and ',
          day: {
            label: 'Day',
            'missing-part': 'day',
          },
          month: {
            label: 'Month',
            'missing-part': 'month',
          },
          year: {
            label: 'Year',
            'missing-part': 'year',
          },
        },
        address: {
          'county-input': {
            label: 'County (optional)',
          },
          'line1-input': {
            label: 'Address line 1',
            'invalid-error': 'Enter address line 1, typically the building and street',
          },
          'line2-input': {
            label: 'Address line 2 (optional)',
          },
          'postcode-input': {
            label: 'Postcode',
            'invalid-error': 'Enter a full UK postcode',
            'missing-error': 'Enter postcode',
            'mandatory-error': 'Enter postcode',
          },
          'town-input': {
            label: 'Town or city',
            'invalid-error': 'Enter town or city',
          },
        },
        'file-upload': {
          'select-file': 'Please select a file.',
          'file-is-empty': 'The selected file is empty. Please choose a file that contains data and try again.',
          'file-is-too-large': 'The selected file is too large. Please upload a file smaller than ',
          'file-type-is-unsupported': 'The selected file type is not supported.',
          uploading: 'Uploading… ',
          upload: 'Upload',
          'uploaded-file': 'Uploaded file: ',
          'api-error': 'Failed to get pre-signed URL: ',
        },
      },
    },
    'cy-GB': {
      core: {
        'default-mandatory-error': 'Mae hwn yn faes gorfodol ac ni all fod yn wag',
        'cannot-be-blank-error': '{{for}} ni all fod yn wag',
        summary: {
          'change-link-text': 'Newid',
        },
        'back-button': {
          'link-text': 'Yn ôl',
        },
        'cookie-banner': {
          heading: 'Cwcis ar {{serviceName}}',
          content: 'Rydym yn defnyddio rhai cwcis hanfodol i wneud i’r gwasanaeth hwn weithio.',
          'hide-action-text': 'Cuddio neges cwcis',
          'view-cookies-action-text': 'Gweld cwcis',
        },
        footer: {
          'cookie-link-text': 'Cwcis',
          copyright: '© Hawlfraint y Goron',
          'content-licence':
            'Mae\'r holl gynnwys ar gael o dan y <a class="govuk-footer__link" href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license">Trwydded Llywodraeth Agored v3.0</a>, ac eithrio lle nodir yn wahanol',
          'ou-statement':
            '©2025. Cedwir pob hawl. Mae’r Brifysgol Agored yn gorfforedig drwy Siarter Brenhinol (RC000391), yn elusen a eithrir yng Nghymru a Lloegr ac yn elusen gofrestredig yn yr Alban (SC038302). Awdurdodir a rheoleiddir y Brifysgol Agored gan yr Awdurdod Ymddygiad Ariannol o ran ei weithgarwch eilradd o froceru credyd.',
          links: {
            accessibility: 'Hygyrchedd',
            'copyright-statement': 'Datganiad hawlfraint',
            privacy: 'Preifatrwydd',
            'terms-and-conditions': 'Telerau ac amodau',
          },
        },
        'cookie-table': {
          'name-column': 'Enw',
          'purpose-column': 'Pwrpas',
          'expires-column': 'Yn dod i ben',
          'session-data-cookie': {
            purpose: 'Yn storio data sesiwn ar gyfer y gwasanaeth',
            expires: '5 awr',
          },
        },
        'phone-number-input': {
          'invalid-error': 'Rhowch rif ffôn, fel 01632 960 001, 07700 900 982 neu +44 808 157 0192',
          'mandatory-error': 'Rhowch rif ffôn',
        },
        'email-input': {
          'invalid-error': 'Rhowch gyfeiriad e-bost yn y fformat cywir, fel name@example.com',
          'mandatory-error': 'Rhowch gyfeiriad e-bost',
        },
        'date-input': {
          'mandatory-error': 'Rhowch {{for}}',
          'real-date-error': '{{for}} rhaid iddo fod yn ddyddiad go iawn',
          'missing-part-error': '{{for}} rhaid iddo gynnwys {{missingParts}} go iawn',
          'missing-part-concat-text': ' a ',
          day: {
            label: 'Dydd',
            'missing-part': 'dydd',
          },
          month: {
            label: 'Mis',
            'missing-part': 'mis',
          },
          year: {
            label: 'Blwyddyn',
            'missing-part': 'blwyddyn',
          },
        },
        address: {
          'county-input': {
            label: 'Sir (dewisol)',
          },
          'line1-input': {
            label: 'Llinell cyfeiriad 1',
            'invalid-error': 'Rhowch linell cyfeiriad 1, fel arfer yr adeilad a’r stryd',
          },
          'line2-input': {
            label: 'Llinell cyfeiriad 2 (dewisol)',
          },
          'postcode-input': {
            label: 'Cod post',
            'invalid-error': 'Rhowch god post llawn y DU',
            'missing-error': 'Rhowch god post',
            'mandatory-error': 'Rhowch god post',
          },
          'town-input': {
            label: 'Tref neu ddinas',
            'invalid-error': 'Rhowch dref neu ddinas',
          },
        },
        'file-upload': {
          'select-file': 'Dewiswch ffeil os gwelwch yn dda.',
          'file-is-empty':
            "Mae'r ffeil a ddewiswyd yn wag. Dewiswch ffeil sy'n cynnwys data a rhowch gynnig arall arni.",
          'file-is-too-large': "Mae'r ffeil a ddewiswyd yn rhy fawr. Uwchlwythwch ffeil sy'n llai na ",
          'file-type-is-unsupported': "Nid yw'r math o ffeil a ddewiswyd yn cael ei gefnogi.",
          uploading: "Wrthi'n uwchlwytho… ",
          upload: 'Uwchlwytho',
          'uploaded-file': "Ffeil wedi'i huwchlwytho: ",
          'api-error': "Methwyd â chael URL wedi'i lofnodi ymlaen llaw: ",
        },
      },
    },
    'fr-CA': {
      core: {
        'default-mandatory-error': 'Ce champ est obligatoire et ne peut pas être vide',
        'cannot-be-blank-error': '{{for}} ne peut pas être vide',
        summary: {
          'change-link-text': 'Changer',
        },
        'back-button': {
          'link-text': 'Retour',
        },
        'cookie-banner': {
          heading: 'Témoins sur {{serviceName}}',
          content: 'Nous utilisons certains témoins essentiels pour faire fonctionner ce service.',
          'hide-action-text': 'Masquer le message des témoins',
          'view-cookies-action-text': 'Afficher les témoins',
        },
        footer: {
          'cookie-link-text': 'Témoins',
          copyright: "© Droit d'auteur de la Couronne",
          'content-licence':
            'Tout le contenu est disponible sous la <a class="govuk-footer__link" href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license">Licence du gouvernement ouvert v3.0</a>, sauf indication contraire',
          links: {
            accessibility: 'Accessibilité',
            'copyright-statement': 'Déclaration de droits d’auteur',
            privacy: 'Confidentialité',
            'terms-and-conditions': 'Modalités et conditions',
          },
        },
        'cookie-table': {
          'name-column': 'Nom',
          'purpose-column': 'But',
          'expires-column': 'Expire',
          'session-data-cookie': {
            purpose: 'Stocke les données de session pour le service',
            expires: '5 heures',
          },
        },
        'phone-number-input': {
          'invalid-error': 'Entrez un numéro de téléphone, comme 01632 960 001, 07700 900 982 ou +44 808 157 0192',
          'mandatory-error': 'Entrez un numéro de téléphone',
        },
        'email-input': {
          'invalid-error': 'Entrez une adresse courriel au format correct, comme nom@example.com',
          'mandatory-error': 'Entrez une adresse courriel',
        },
        'date-input': {
          'mandatory-error': 'Entrez {{for}}',
          'real-date-error': '{{for}} doit être une date réelle',
          'missing-part-error': '{{for}} doit inclure un(e) {{missingParts}} réel(le)',
          'missing-part-concat-text': ' et ',
          day: {
            label: 'Jour',
            'missing-part': 'jour',
          },
          month: {
            label: 'Mois',
            'missing-part': 'mois',
          },
          year: {
            label: 'Année',
            'missing-part': 'année',
          },
        },
        address: {
          'county-input': {
            label: 'Comté (optionnel)',
          },
          'line1-input': {
            label: 'Adresse ligne 1',
            'invalid-error': 'Entrez l’adresse ligne 1, généralement le bâtiment et la rue',
          },
          'line2-input': {
            label: 'Adresse ligne 2 (optionnel)',
          },
          'postcode-input': {
            label: 'Code postal',
            'invalid-error': 'Entrez un code postal complet du Royaume-Uni',
            'missing-error': 'Entrez un code postal',
            'mandatory-error': 'Entrez un code postal',
          },
          'town-input': {
            label: 'Ville ou cité',
            'invalid-error': 'Entrez une ville ou une cité',
          },
        },
        'file-upload': {
          'select-file': 'Veuillez sélectionner un fichier.',
          'file-is-empty':
            'Le fichier sélectionné est vide. Veuillez choisir un fichier contenant des données et réessayer.',
          'file-is-too-large':
            'Le fichier sélectionné est trop volumineux. Veuillez téléverser un fichier de moins de ',
          'file-type-is-unsupported': 'Le type de fichier sélectionné n’est pas pris en charge.',
          uploading: 'Téléversement en cours… ',
          upload: 'Téléverser',
          'uploaded-file': 'Fichier téléversé : ',
          'api-error': 'Échec de l’obtention de l’URL pré-signée : ',
        },
      },
    },
    'fr-FR': {
      core: {
        'default-mandatory-error': 'Ce champ est obligatoire et ne peut pas être vide',
        'cannot-be-blank-error': '{{for}} ne peut pas être vide',
        summary: {
          'change-link-text': 'Changer',
        },
        'back-button': {
          'link-text': 'Retour',
        },
        'cookie-banner': {
          heading: 'Cookies sur {{serviceName}}',
          content: 'Nous utilisons certains cookies essentiels pour faire fonctionner ce service.',
          'hide-action-text': 'Masquer le message des cookies',
          'view-cookies-action-text': 'Voir les cookies',
        },
        footer: {
          'cookie-link-text': 'Cookies',
          copyright: "© Droits d'auteur de la Couronne",
          'content-licence':
            'Tout le contenu est disponible sous la <a class="govuk-footer__link" href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license">Licence Ouverte du Gouvernement v3.0</a>, sauf indication contraire',
        },
        'cookie-table': {
          'name-column': 'Nom',
          'purpose-column': 'But',
          'expires-column': 'Expire',
          'session-data-cookie': {
            purpose: 'Stocke les données de session pour le service',
            expires: '5 heures',
          },
        },
        'phone-number-input': {
          'invalid-error': 'Entrez un numéro de téléphone, comme 01632 960 001, 07700 900 982 ou +44 808 157 0192',
          'mandatory-error': 'Entrez un numéro de téléphone',
        },
        'email-input': {
          'invalid-error': 'Entrez une adresse e-mail au format correct, comme nom@example.com',
          'mandatory-error': 'Entrez une adresse e-mail',
        },
        'date-input': {
          'mandatory-error': 'Entrez {{for}}',
          'real-date-error': '{{for}} doit être une date réelle',
          'missing-part-error': '{{for}} doit inclure un(e) {{missingParts}} réel(le)',
          'missing-part-concat-text': ' et ',
          day: {
            label: 'Jour',
            'missing-part': 'jour',
          },
          month: {
            label: 'Mois',
            'missing-part': 'mois',
          },
          year: {
            label: 'Année',
            'missing-part': 'année',
          },
        },
        address: {
          'county-input': {
            label: 'Comté (optionnel)',
          },
          'line1-input': {
            label: 'Adresse ligne 1',
            'invalid-error': 'Entrez l’adresse ligne 1, généralement le bâtiment et la rue',
          },
          'line2-input': {
            label: 'Adresse ligne 2 (optionnel)',
          },
          'postcode-input': {
            label: 'Code postal',
            'invalid-error': 'Entrez un code postal complet du Royaume-Uni',
            'missing-error': 'Entrez un code postal',
            'mandatory-error': 'Entrez un code postal',
          },
          'town-input': {
            label: 'Ville ou cité',
            'invalid-error': 'Entrez une ville ou une cité',
          },
        },
        'file-upload': {
          'select-file': 'Veuillez sélectionner un fichier.',
          'file-is-empty':
            'Le fichier sélectionné est vide. Veuillez choisir un fichier contenant des données et réessayer.',
          'file-is-too-large':
            'Le fichier sélectionné est trop volumineux. Veuillez téléverser un fichier de moins de ',
          'file-type-is-unsupported': 'Le type de fichier sélectionné n’est pas pris en charge.',
          uploading: 'Téléversement en cours… ',
          upload: 'Téléverser',
          'uploaded-file': 'Fichier téléversé : ',
          'api-error': 'Échec de la récupération de l’URL pré-signée : ',
        },
      },
    },
  };

  return staticTranslations;
}
