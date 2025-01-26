import { ForbiddenException, HttpStatus } from "@nestjs/common";

export class CustomException {

    validateUserId(userId: number, id: number) {
        if (userId !== id) {
            throw new ForbiddenException({
                status: HttpStatus.FORBIDDEN,
                message: 'You cannot modify this user',
                error: 'forbidden_action'
            });
        }
    }
}