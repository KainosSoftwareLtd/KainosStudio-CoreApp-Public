import { FixedOptionValueElement, ValueElement } from '../service/Element.js';
import { logger } from '../index.js';

export interface DataRetrievalRequest {
  userId?: string;
  fields: string[];
  /** Current form session data — enables session-aware conditional logic in the data retrieval API. */
  sessionData?: Record<string, string>;
}

/** Option item for a multi-value field returned by the data retrieval API. */
export interface FieldOption {
  text: string;
  value?: string;
  valueText?: string;
  hint?: string;
}

/**
 * Structured response from the data retrieval API.
 * Also accepts the legacy flat shape (Record<string, unknown>) for backward compatibility.
 */
export interface DataRetrievalResponse {
  /** Scalar values keyed by field name. */
  values?: Record<string, string>;
  /** Option lists for multi-value fields, keyed by field name. */
  options?: Record<string, FieldOption[]>;
  /** Legacy flat shape — field name mapped directly to its value. */
  [key: string]: unknown;
}

export class DataRetrievalService {
  public async enrichData(
    externalUrl: string,
    allElements: ValueElement[],
    data: Record<string, unknown>,
    userId?: string,
  ): Promise<void> {
    logger.info(`Enriching data with external API: ${externalUrl}`);

    try {
      const propertiesToFill = this.getPropertiesToFill(allElements, data);
      if (!propertiesToFill.length) {
        logger.debug(`No fields to fill.`);
        return;
      }

      logger.debug(`Enriching fields:`, propertiesToFill);

      const requestData: DataRetrievalRequest = {
        ...(userId && { userId }),
        fields: propertiesToFill,
        sessionData: data as Record<string, string>,
      };
      const responseData = await this.makeRequest(externalUrl, requestData);

      // Structured response: apply scalar values and dynamic options separately
      if ((responseData.values && typeof responseData.values === 'object')
        || (responseData.options && typeof responseData.values === 'object')) {
        if (responseData.values) {
          Object.assign(data, responseData.values);
        }
        if (responseData.options) {
          for (const element of allElements) {
            const dynamicOptions = responseData.options[element.name];
            if (dynamicOptions && 'options' in element) {
              (element as unknown as FixedOptionValueElement).options = dynamicOptions;
            }
          }
        }
      }
      else {
        // Legacy flat response — merge directly into data for backward compatibility
        Object.assign(data, responseData);
      }

      logger.info(`Successfully enriched data`);
    } catch (error) {
      logger.error('Failed to retrieve data from external API:', error);
    }
  }

  private async makeRequest(url: string, requestData: DataRetrievalRequest): Promise<DataRetrievalResponse> {
    logger.debug(`Sending request to external API`, requestData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (response.ok) {
      const responseData = await response.json();
      logger.debug(`Response from external API for fields:`, responseData);
      return responseData as DataRetrievalResponse;
    } else {
      const errorBody = await response.text();
      const errorMessage = `Data retrieval failed with status ${response.status}: ${response.statusText}. Response body: ${errorBody}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  private getPropertiesToFill(allElements: ValueElement[], data: Record<string, unknown>): string[] {
    const propertiesToFill: string[] = [];

    allElements.forEach((element) => {
      if (element.type === 'DatePickerField') {
        const dayProperty = `${element.name}-day`;
        const monthProperty = `${element.name}-month`;
        const yearProperty = `${element.name}-year`;

        if (!data[dayProperty]) propertiesToFill.push(dayProperty);
        if (!data[monthProperty]) propertiesToFill.push(monthProperty);
        if (!data[yearProperty]) propertiesToFill.push(yearProperty);
      } else if (element.type === 'AddressField') {
        const line1Property = `${element.name}-line1`;
        const line2Property = `${element.name}-line2`;
        const townProperty = `${element.name}-town`;
        const countyProperty = `${element.name}-county`;
        const postcodeProperty = `${element.name}-postcode`;

        if (!data[line1Property]) propertiesToFill.push(line1Property);
        if (!data[line2Property]) propertiesToFill.push(line2Property);
        if (!data[townProperty]) propertiesToFill.push(townProperty);
        if (!data[countyProperty]) propertiesToFill.push(countyProperty);
        if (!data[postcodeProperty]) propertiesToFill.push(postcodeProperty);
      } else {
        const hasNoValue = !data[element.name];
        // Always fetch a field whose options list is empty — it needs dynamic options
        // from the API even when a scalar value already exists in session.
        const hasEmptyOptions =
          'options' in element &&
          Array.isArray((element as unknown as { options: unknown[] }).options) &&
          (element as unknown as { options: unknown[] }).options.length === 0;

        if (hasNoValue || hasEmptyOptions) {
          propertiesToFill.push(element.name);
        }
      }
    });

    return propertiesToFill;
  }
}
