import { Test, TestingModule } from '@nestjs/testing';
import { EtcdTestController } from './etcd-test.controller';
import { EtcdTestService } from './etcd-test.service';

describe('EtcdTestController', () => {
  let controller: EtcdTestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EtcdTestController],
      providers: [EtcdTestService],
    }).compile();

    controller = module.get<EtcdTestController>(EtcdTestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
