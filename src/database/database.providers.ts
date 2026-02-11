import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { getTypeOrmOptions } from '../config/database-config.util';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const configService = new ConfigService();
      const options = getTypeOrmOptions(configService);
      const dataSource = new DataSource({
        ...options,
        entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
        ],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
