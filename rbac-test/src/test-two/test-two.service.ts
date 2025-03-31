import { Injectable } from '@nestjs/common';
import { CreateTestTwoDto } from './dto/create-test-two.dto';
import { UpdateTestTwoDto } from './dto/update-test-two.dto';

@Injectable()
export class TestTwoService {
  create(createTestTwoDto: CreateTestTwoDto) {
    return 'This action adds a new testTwo';
  }

  findAll() {
    return `This action returns all testTwo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} testTwo`;
  }

  update(id: number, updateTestTwoDto: UpdateTestTwoDto) {
    return `This action updates a #${id} testTwo`;
  }

  remove(id: number) {
    return `This action removes a #${id} testTwo`;
  }
}
