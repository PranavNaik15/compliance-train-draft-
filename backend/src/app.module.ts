import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { WebinarsModule } from './webinars/webinars.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { HealthModule } from './health/health.module';
import { QuizModule } from './quiz/quiz.module';
import { AuthModule } from './auth/auth.module';
import { MembershipsModule } from './memberships/memberships.module';
import { CartModule } from './cart/cart.module';
import { ContactModule } from './contact/contact.module';
import { OnsiteTrainingModule } from './onsite-training/onsite-training.module';
import { SupportModule } from './support/support.module';
import { SpeakersModule } from './speakers/speakers.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { WebsiteContentModule } from './website-content/website-content.module';
import { MediaModule } from './media/media.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SettingsModule } from './settings/settings.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    WebinarsModule,
    SpeakersModule,
    RegistrationsModule,
    UsersModule,
    OrdersModule,
    PaymentsModule,
    WebsiteContentModule,
    MediaModule,
    ReportsModule,
    NotificationsModule,
    SettingsModule,
    HealthModule,
    QuizModule,
    AuthModule,
    MembershipsModule,
    CartModule,
    ContactModule,
    OnsiteTrainingModule,
    SupportModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
