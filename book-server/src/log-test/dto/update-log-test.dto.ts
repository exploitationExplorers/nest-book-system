import { PartialType } from '@nestjs/mapped-types';
import { CreateLogTestDto } from './create-log-test.dto';

export class UpdateLogTestDto extends PartialType(CreateLogTestDto) {}
