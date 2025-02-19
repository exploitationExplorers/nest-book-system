import { Injectable } from '@nestjs/common';
import { CreateLogTestDto } from './dto/create-log-test.dto';
import { UpdateLogTestDto } from './dto/update-log-test.dto';

@Injectable()
export class LogTestService {
  create(createLogTestDto: CreateLogTestDto) {
    return 'This action adds a new logTest';
  }

  findAll() {
    return `This action returns all logTest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} logTest`;
  }

  update(id: number, updateLogTestDto: UpdateLogTestDto) {
    return `This action updates a #${id} logTest`;
  }

  remove(id: number) {
    return `This action removes a #${id} logTest`;
  }
}
