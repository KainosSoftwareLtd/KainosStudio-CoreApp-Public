import CookiesTable, { CookiesTableItem } from '../../src/elements/CookiesTable.js';

describe('CookiesTable', () => {
  it('should create CookiesTable with correct properties', () => {
    const cookies = [
      [new CookiesTableItem('Cookie 1'), new CookiesTableItem('Description 1')],
      [new CookiesTableItem('Cookie 2'), new CookiesTableItem('Description 2')]
    ];
    const displayText = 'Cookies Information';

    const table = new CookiesTable(displayText, cookies);

    expect(table.type).toBe('CookiesTable');
    expect(table.displayText).toBe(displayText);
    expect(table.cookies).toEqual(cookies);
  });
});

describe('CookiesTableItem', () => {
  it('should create CookiesTableItem with correct text', () => {
    const text = 'Test Cookie';
    const item = new CookiesTableItem(text);
    
    expect(item.text).toBe(text);
  });
});