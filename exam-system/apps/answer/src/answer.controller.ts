import { Controller, Get } from '@nestjs/common';
import { AnswerService } from './answer.service';

@Controller()
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Get()
  getHello(): string {
    return this.answerService.getHello();
  }
}
