import {
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

//Activate when everything is ready
// @UseGuards(AuthorizationGuard)
@Injectable()
export class ClientsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}
  private clients: Client[] = [];

  /**
   * Find a client by their ID
   * @param clientId: string
   * @returns: Client
   */
  async findClientById(clientId: string) {
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
    try {
      const exist = await this.db.query(queries.client.byEmail, [
        clientData.email,
      ]);
      if (exist.rows.length > 0) {
        console.log('Client with this email already exists');
      }

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
      return newClient.rows[0];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Find a client by their ID and updates the information of the client
   * @param clientId: string
   * @param clientData: Partial<Omit<Client, 'client_id' | 'created_at' | 'updated_at'>>
   * @returns: Client
   */
  async updateClient(clientId: string, clientData: UpdateClientDto) {
    console.log(clientId, clientData);
    const { ...updates } = clientData;
    console.log(updates);
    const updateKeys = Object.keys(updates).filter(
      (key) => updates[key as keyof typeof updates] !== undefined,
    );
    console.log(updateKeys);

    if (updateKeys.length === 0) {
      throw new Error('No valid fields to update');
    }

    let setClause: string[] = [];
    let paramsArray: any[] = [];
    let index = 1;

    for (const key of updateKeys) {
      const validKey = key as keyof typeof updates;
      setClause.push(`${key} = $${index}`);
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
    console.log('Executing query:', queryString, 'with params:', paramsArray);
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
