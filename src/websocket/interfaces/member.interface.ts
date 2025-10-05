import { ERoleMember } from "../enums";

export interface IMember {
    userId: string;
    roomId: string;
    role: ERoleMember;
}