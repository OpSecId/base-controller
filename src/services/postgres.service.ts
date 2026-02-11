import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { getPgPoolConfig } from '../config/database-config.util';

@Injectable()
export class PostgresService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor(private configService: ConfigService) {
    this.pool = new Pool(getPgPoolConfig(this.configService));
  }

  async onModuleInit() {
    try {
      await this.pool.connect();
      console.log('Connected to PostgreSQL');
    } catch (error) {
      console.error('Failed to connect to PostgreSQL', error);
    }
  }

  async onModuleDestroy() {
    console.log("Disconnecting from PostgresSQL");
    await this.pool.end();
  }

  async query(text: string, params?: any[]): Promise<any> {
    return this.pool.query(text, params);
  }

  async getClient() {
    return this.pool.connect();
  }
}
