import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Connect to database when NestJS starts
    await this.$connect();
  }

  async onModuleDestroy() {
    // Disconnect when NestJS shuts down
    await this.$disconnect();
  }
}
