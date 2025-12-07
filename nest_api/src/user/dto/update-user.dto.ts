import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from 'src/auth/dto/create-account.dto';

export class UpdateUserDto extends PartialType(CreateAccountDto) {}
