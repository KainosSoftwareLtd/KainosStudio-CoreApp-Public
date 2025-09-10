import { ValueElement } from '../service/Element.js';
import { logger } from '../index.js';

export interface DataRetrievalRequest {
  userId?: string;
  fields: string[];
}

export interface DataRetrievalResponse extends Record<string, unknown> {
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
      };
      const responseData = await this.makeRequest(externalUrl, requestData);

      Object.assign(data, responseData);
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
        if (!data[element.name]) {
          propertiesToFill.push(element.name);
        }
      }
    });

    return propertiesToFill;
  }
}
