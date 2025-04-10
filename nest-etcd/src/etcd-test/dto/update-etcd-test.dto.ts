import { PartialType } from '@nestjs/mapped-types';
import { CreateEtcdTestDto } from './create-etcd-test.dto';

export class UpdateEtcdTestDto extends PartialType(CreateEtcdTestDto) {}
