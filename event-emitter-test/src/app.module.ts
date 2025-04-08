import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventModule } from './event/event.module';
import { EventTwoModule } from './event-two/event-two.module';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { EmailModule } from './email/email.module';
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    EventModule,
    EventTwoModule,
    UserModule,
    NotificationModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
