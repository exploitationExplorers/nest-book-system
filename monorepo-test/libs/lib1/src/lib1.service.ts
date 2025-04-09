import { Injectable } from '@nestjs/common';

@Injectable()
export class Lib1Service {
  test() {
    return 'lib';
  }
}
