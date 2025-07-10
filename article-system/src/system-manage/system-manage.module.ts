import { Module } from '@nestjs/common';
import { SystemManageController } from './system-manage.controller';
import { SystemManageService } from './system-manage.service';

@Module({
  controllers: [SystemManageController],
  providers: [SystemManageService],
})
export class SystemManageModule {}