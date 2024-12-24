import { OmitType } from '@nestjs/mapped-types';
import { RegisterAuthDto } from './register-auth.dto';

export class LoginAuthDto extends OmitType(RegisterAuthDto, ['name', 'lastname'] as const) {
}