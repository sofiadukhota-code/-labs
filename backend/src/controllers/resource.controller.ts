import type { Request, Response, NextFunction } from "express";
import { ResourceService } from "../services/resource.service.js";
import type { CreateResourceRequestDto } from "../dtos/resource.dto.js";
import type { ResourceQueryDto } from "../dtos/resource.dto.js";

export const ResourceController = {
    getAll: async (req: Request, res: Response, next: NextFunction) => {
        try {
          const query = req.query as ResourceQueryDto;
          const data = await ResourceService.getAllResources(query);
          return res.json(data);
        } catch(error) {
            next(error);
        }
    },
    getById: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const resource = ResourceService.getResourceById(id);

            if (!resource) {
                res.status(404).json({
                    error: { code: "Not found", message: "Resource with this ID not found" }
                })
                return;
            }
            res.status(200).json(resource);
        } catch (error) {
            next(error);
        }
    },
    create: (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto: CreateResourceRequestDto = req.body;
            const newResource = ResourceService.createResource(dto);
            res.status(201).json(newResource);
        } catch (error) {
            next(error);
        }
    },
    update: (req: Request, res: Response, next: NextFunction) => {
        try {
            const updated = ResourceService.updateResource(req.params.id as string, req.body);
            updated ? res.json(updated) : res.status(404).json({ error: "Not found" });
        } catch (e) { next(e); }
    },
    patch: (req: any, res: any) => {
        const id = req.params.id as string;
        const updated = ResourceService.updateResource(id, req.body);
        updated ? res.json(updated) : res.status(404).json({ error: "Not found" });
    },
    delete: (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = String(req.params.id);
            const deleted = ResourceService.deleteResource(id);

            if (!deleted) {
                res.status(404).json({ error: { message: "Resource not found" } });
                return;
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },
    getTopLiked: async (req: Request, res: Response, next: NextFunction) => {
  try {
    const top = await ResourceService.getTopLikedResource();
    if (!top) {
      res.status(404).json({ error: { code: "Not found", message: "No rated resources found" } });
      return;
    }
    res.status(200).json(top);
  } catch (error) {
    next(error);
  }
},
}