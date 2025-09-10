import { ObjectBuilder } from "../../src/creator/ObjectBuilder.js";
import { RequestMappings } from "../../src/service/Service.js";

describe('ObjectBuilder', () => {
    let objectBuilder: ObjectBuilder;

    beforeEach(() => {
        objectBuilder = new ObjectBuilder();
    });

    it('should map flat object according to simple mappings', async () => {
        const data = { firstName: 'John', lastName: 'Doe' };
        const mappings: RequestMappings = {
            firstName: 'name.first',
            lastName: 'name.last'
        };

        const result = await objectBuilder.create(data, mappings);

        expect(result).toEqual({
            name: {
                first: 'John',
                last: 'Doe'
            }
        });
    });

    it('should handle empty input data', async () => {
        const data = {};
        const mappings: RequestMappings = {
            firstName: 'name.first'
        };

        const result = await objectBuilder.create(data, mappings);

        expect(result).toEqual({});
    });

    it('should handle empty mappings', async () => {
        const data = { firstName: 'John' };
        const mappings: RequestMappings = {};

        const result = await objectBuilder.create(data, mappings);

        expect(result).toEqual({});
    });

    it('should handle complex nested paths', async () => {
        const data = { 
            userId: '123', 
            userEmail: 'test@example.com',
            userAge: 25
        };
        const mappings: RequestMappings = {
            userId: 'user.profile.id',
            userEmail: 'user.contact.email',
            userAge: 'user.profile.details.age'
        };

        const result = await objectBuilder.create(data, mappings);

        expect(result).toEqual({
            user: {
                profile: {
                    id: '123',
                    details: {
                        age: 25
                    }
                },
                contact: {
                    email: 'test@example.com'
                }
            }
        });
    });

    it('should handle array paths in mappings', async () => {
        const data = { 
            item1: 'first',
            item2: 'second'
        };
        const mappings: RequestMappings = {
            item1: 'items[0]',
            item2: 'items[1]'
        };
    
        const result = await objectBuilder.create(data, mappings);
    
        expect(result).toEqual({
            "items[0]": "first",
            "items[1]": "second"
        });
    });

    it('should handle undefined values in data', async () => {
        const data = { 
            name: 'John',
            age: undefined
        };
        const mappings: RequestMappings = {
            name: 'user.name',
            age: 'user.age'
        };

        const result = await objectBuilder.create(data, mappings);

        expect(result).toEqual({
            user: {
                name: 'John',
                age: undefined
            }
        });
    });

    it('should handle array-like paths in mappings', async () => {
        const data = { 
            item1: 'first',
            item2: 'second'
        };
        const mappings: RequestMappings = {
            item1: 'items[0]',
            item2: 'items[1]'
        };

        const result = await objectBuilder.create(data, mappings);

        expect(result).toEqual({
            "items[0]": "first",
            "items[1]": "second"
        });
    });
});