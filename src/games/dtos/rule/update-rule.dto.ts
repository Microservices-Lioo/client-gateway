import { PartialType } from '@nestjs/mapped-types';
import { CreateRuleDto } from './create-rule.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateRuleDto extends PartialType(CreateRuleDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
