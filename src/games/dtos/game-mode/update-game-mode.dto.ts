import { PartialType } from "@nestjs/mapped-types";
import { CreateGameModeDto } from "./create-game-mode.dto";
import { IsNotEmpty, IsNumber } from "class-validator";


export class UpdateGameModeDto extends PartialType(CreateGameModeDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}