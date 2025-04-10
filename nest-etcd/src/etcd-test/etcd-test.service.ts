import { Injectable } from '@nestjs/common';
import { CreateEtcdTestDto } from './dto/create-etcd-test.dto';
import { UpdateEtcdTestDto } from './dto/update-etcd-test.dto';

@Injectable()
export class EtcdTestService {
  create(createEtcdTestDto: CreateEtcdTestDto) {
    return 'This action adds a new etcdTest';
  }

  findAll() {
    return `This action returns all etcdTest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} etcdTest`;
  }

  update(id: number, updateEtcdTestDto: UpdateEtcdTestDto) {
    return `This action updates a #${id} etcdTest`;
  }

  remove(id: number) {
    return `This action removes a #${id} etcdTest`;
  }
}
