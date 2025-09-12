import { ERoles } from "../enums";

export interface IUser {
    id: string;
    name: string;
    lastname: string;
    email: string;
}

export interface IUserRole extends IUser {
    roles: ERoles[]
}