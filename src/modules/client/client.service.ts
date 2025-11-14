import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Client } from './interface/client.interface';
import { NewClientDto } from './dto/newClient.dto';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { DATABASE } from '../db/db.provider';
import Database from '@lodestar-official/database/dist/components/Database';
import { queries } from '@/queries';
import { UpdateClientDto } from './dto/updateClient.dto';
import { ClientCreateError } from '@/common/errors/client_create.error';

// ? Activate when everything is ready
// @UseGuards(AuthorizationGuard)
@Injectable()
export class ClientsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  /**
   * Find a client by their ID
   * @param clientId: string
   * @returns: Client
   */
  async findClientById(clientId: string): Promise<Client> {
    const client = await this.db.query(queries.client.getInfo, [clientId]);

    if (!client || client.rows.length === 0) {
      throw new NotFoundException('Client not found');
    }

    return client.rows[0];
  }

  /**
   * @returns: Client[]
   */
  async getAllClients(): Promise<Client[]> {
    const clients = await this.db.query(queries.client.all);
    return clients.rows;
  }

  /**
   *
   * @param clientData: Client
   * @returns: Client
   */
  async createClient(clientData: NewClientDto) {
    const {
      tenant_id,
      first_name,
      last_name,
      document_type_id,
      document_number,
      email,
      phone,
      birthdate,
      address,
      customer_segment_type,
    } = clientData;

    const newClient = await this.db.query(queries.client.create, [
      tenant_id,
      first_name,
      last_name,
      document_type_id,
      document_number,
      email,
      phone,
      birthdate,
      address,
      customer_segment_type,
    ]);

    if (newClient.rows.length == 0) throw new ClientCreateError(email);
    return { message: 'Client created', client: newClient };
  }

  /**
   * Find a client by their ID and updates the information of the client
   * @param clientId: string
   * @param clientData: Partial<Omit<Client, 'client_id' | 'created_at' | 'updated_at'>>
   * @returns: Client
   */
  async updateClient(clientId: string, clientData: UpdateClientDto) {
    const { ...updates } = clientData;

    const updateKeys = Object.keys(updates).filter(
      (key) => updates[key as keyof typeof updates] !== undefined,
    );

    if (updateKeys.length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    let setClause: string[] = [];
    let paramsArray: any[] = [];
    let index = 1;

    for (const key of updateKeys) {
      const validKey = key as keyof typeof updates;
      setClause.push(`"${key}" = $${index}`);
      paramsArray.push(updates[validKey]);
      index++;
    }

    paramsArray.push(clientId);

    const setString = setClause.join(', ');

    const queryString = `
      UPDATE core.tenant_customer
      SET ${setString}
      WHERE tenant_customer_id = $${index}
      RETURNING *
    `;

    try {
      const res = await this.db.query(queryString, paramsArray);
      return res.rows[0];
    } catch (error) {
      console.error('Error updating client:', error);
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Find a client by their ID and deletes the client
   * @param clientId: string
   * @returns: void
   */
  async deleteClient(clientId: string) {
    const client = await this.findClientById(clientId);

    if (!client) {
      throw new Error('Client not found');
    }

    try {
      const res = await this.db.query(queries.client.delete, [clientId]);
      return res.rows[0];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
