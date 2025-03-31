import { Injectable } from '@nestjs/common';
import { CreateTestOneDto } from './dto/create-test-one.dto';
import { UpdateTestOneDto } from './dto/update-test-one.dto';

@Injectable()
export class TestOneService {
  create(createTestOneDto: CreateTestOneDto) {
    return 'This action adds a new testOne';
  }

  findAll() {
    return `This action returns all testOne`;
  }

  findOne(id: number) {
    return `This action returns a #${id} testOne`;
  }

  update(id: number, updateTestOneDto: UpdateTestOneDto) {
    return `This action updates a #${id} testOne`;
  }

  remove(id: number) {
    return `This action removes a #${id} testOne`;
  }
}
