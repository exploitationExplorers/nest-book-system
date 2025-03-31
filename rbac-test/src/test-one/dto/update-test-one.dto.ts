import { PartialType } from '@nestjs/mapped-types';
import { CreateTestOneDto } from './create-test-one.dto';

export class UpdateTestOneDto extends PartialType(CreateTestOneDto) {}
