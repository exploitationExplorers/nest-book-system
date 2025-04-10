import { Test, TestingModule } from '@nestjs/testing';
import { EtcdTestService } from './etcd-test.service';

describe('EtcdTestService', () => {
  let service: EtcdTestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EtcdTestService],
    }).compile();

    service = module.get<EtcdTestService>(EtcdTestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
