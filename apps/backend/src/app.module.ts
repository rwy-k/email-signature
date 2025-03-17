import { Module } from '@nestjs/common';
import { ControllersModule } from './controllers/controllers.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [ControllersModule, ServicesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}