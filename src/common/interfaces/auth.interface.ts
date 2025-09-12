import { IUserRole } from "./user.interface";

export interface IAuth {
    user: IUserRole;
    access_token: string;
    refresh_token: string;
}