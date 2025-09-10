import { RequestMappings } from "../service/Service.js";
import objectPath from "object-path";

export class ObjectBuilder {
    public async create(data: any, mappings: RequestMappings) {
        let output: any = {};
        Object.entries(data).forEach(param => {
            objectPath.set(output, mappings[param[0]], data[param[0]]);
            }
        )
        return output;
    }
}