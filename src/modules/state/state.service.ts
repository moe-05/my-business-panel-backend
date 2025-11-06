import { ConstantNotFoundError } from '@/common/errors/constant_not_found.error';
import { IRole } from '@/common/interfaces/role.interface';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { config as dotenvConfig } from 'dotenv';
import { DATABASE } from '../db/db.provider';
import Database from '@lodestar-official/database';
import { queries } from '@/queries';

dotenvConfig();

@Injectable()
export class StateService implements OnModuleInit {
  private readonly constants: Map<string, any> = new Map();
  private readonly roles: Map<number, IRole> = new Map();
  private readonly tokenBlacklist: Map<string, string> = new Map();
  private isInitialized: boolean = false;

  private readonly initPromise: Promise<void>;
  constructor(@Inject(DATABASE) private readonly db: Database) {
    this.initPromise = this.loadState();
  }

  async onModuleInit() {}
  public async waitForInitialization(): Promise<void> {
    if (this.isInitialized) return;
    await this.initPromise;
  }

  getConstant<T>(key: string): T {
    const value = this.constants.get(key);
    if (!value) {
      console.error('Error finding constant:', key);
      console.log('Available constants:', Array.from(this.constants.keys()));
      throw new ConstantNotFoundError(key);
    }
    return value;
  }

  async loadState() {
    this.loadConstants();
    await this.loadRoles();
  }

  private async loadRoles() {
    const fetchedData = await this.db.query(queries.role.all);
    const roles = fetchedData.rows as IRole[];
    roles.forEach((role) => this.roles.set(role.role_id, role));
  }

  private loadConstants() {
    this.constants.set('JWT_SECRET', process.env.JWT_SECRET);
    this.constants.set(
      'PASSWORD_SALT_ROUNDS',
      parseInt(process.env.PASSWORD_SALT_ROUNDS as string),
    );
    this.constants.set('JWT_EXPIRES_IN', process.env.JWT_EXPIRES_IN);
  }
}
