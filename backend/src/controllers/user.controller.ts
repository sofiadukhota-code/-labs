import type { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service.js";
import type { CreateUserRequestDto } from "../dtos/user.dto.js";

export const UserController = {
    getAll: (req:  Request, res: Response) => {
        const users = UserService.getAllUsers();
        res.status(200).json(users);
    },
    getById: (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const user = UserService.getUserById(id);

            if(!user) {
                res.status(404).json({ error: {code: "Not found", message: "User not found"}});
                return;
            }
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    },
    create: (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto: CreateUserRequestDto = req.body;
            const newUser = UserService.createUser(dto);
            res.status(201).json(newUser)
        } catch (error) {
            next (error);
        }
    },
    update: (req: Request, res: Response, next: NextFunction) => {
        try {
            const updated = UserService.updateUser(req.params.id as string, req.body)
            updated ? res.json(updated) : res.status(404).json({ error: "User not found" });
        } catch(e) {next(e); }
    },
    delete: (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const deleted = UserService.deleteUser(id);

            if(!deleted) {
                res.status(404).json({ error: {message: "User not found"}});
                return;
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}