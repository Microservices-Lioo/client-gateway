import { ForbiddenException, HttpStatus } from "@nestjs/common";

export class CustomException {

    validateUserId(userId: string, id: string) {
        if (userId !== id) {
            throw new ForbiddenException({
                status: HttpStatus.FORBIDDEN,
                message: 'This action is not allowed for you',
                code: 'forbidden_action'
            });
        }
    }
}