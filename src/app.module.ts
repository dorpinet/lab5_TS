import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksController } from './books/books.controller';
import { BooksService } from './books/books.service';
import { BooksModule } from './books/books.module';
import { SharedModule } from './shared/shared.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [BooksModule, SharedModule, OrdersModule],
  controllers: [AppController, BooksController],
  providers: [AppService, BooksService],
})
export class AppModule {}
