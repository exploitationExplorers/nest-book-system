import { PartialType } from '@nestjs/mapped-types';
import { CreateTestTwoDto } from './create-test-two.dto';

export class UpdateTestTwoDto extends PartialType(CreateTestTwoDto) {}
