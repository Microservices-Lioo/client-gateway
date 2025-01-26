import { ForbiddenException, HttpStatus } from "@nestjs/common";

export class CustomException {

    validateUserId(userId: number, id: number) {
        if (userId !== id) {
            throw new ForbiddenException({
                status: HttpStatus.FORBIDDEN,
                message: 'This action is not allowed for you',
                error: 'forbidden_action'
            });
        }
    }
}