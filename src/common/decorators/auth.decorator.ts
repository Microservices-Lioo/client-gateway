import { applyDecorators, UseGuards } from "@nestjs/common";
import { ERoles } from "../enums";
import { AuthGuard, RolesGuard } from "../guards";
import { Roles } from "./roles.decorator";


export function Auth(...roles: ERoles[]) {
    return applyDecorators(Roles(roles) , UseGuards(AuthGuard, RolesGuard))
}