import { type Resource } from "../dtos/resource.dto.js";
const resources: Resource[] = [];

export const ResourceRepository = {
    getAll: (): Resource[] => {
        return resources;
    },
    getById: (id: string): Resource | undefined => {
        return resources.find(r => r.id === id);
    },
    add: (resource: Resource): Resource => {
        resources.push(resource);
        return resource;
    },
    update: (id: string, dto: Partial<Resource>) => {
        const index = resources.findIndex(r => r.id === id);
        if (index === -1) return null;
        resources[index] = { ...resources[index], ...dto } as Resource;
        return resources[index];
    },
    delete: (id:string): boolean => {
        const index = resources.findIndex(r => r.id === id);
        if(index !== -1) {
            resources.splice(index, 1);
            return true;
        }
        return false;
    }
}
