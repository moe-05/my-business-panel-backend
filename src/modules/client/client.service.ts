import { Injectable, UseGuards } from '@nestjs/common';
import { Client } from './interface/client.interface';
import { NewClientDto } from './dto/newClient.dto';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';

//Activate when everything is ready
// @UseGuards(AuthorizationGuard)
@Injectable()
export class ClientsService {
  private clients: Client[] = [];

  /**
   * Find a client by their ID
   * @param clientId: string
   * @returns: Client
   */
  findClientById(clientId: string): Client {
    const client = this.clients.find((c) => c.client_id === clientId);

    if (!client) {
      throw new Error('Client not found');
    }

    return client;
  }

  /**
   * @returns: Client[]
   */
  getAllClients(): Client[] {
    return this.clients;
  }

  /**
   *
   * @param clientData: Client
   * @returns: Client
   */
  createClient(clientData: NewClientDto) {
    const exist = this.clients.find((c) => c.email === clientData.email);
    if (exist) {
      throw new Error('Client with this email already exists');
    }
    this.clients.push({
      client_id: 'something_cool',
      created_at: new Date(),
      updated_at: new Date(),
      ...clientData,
    });
    return clientData;
  }

  /**
   * Find a client by their ID and updates the information of the client
   * @param clientId: string
   * @param clientData: Partial<Omit<Client, 'client_id' | 'created_at' | 'updated_at'>>
   * @returns: Client
   */
  updateClient(
    clientId: string,
    clientData: Partial<
      Omit<Client, 'client_id' | 'created_at' | 'updated_at'>
    >,
  ): Client {
    const client = this.findClientById(clientId);

    Object.assign(client, clientData, { updated_at: new Date() });
    return client;
  }

  /**
   * Find a client by their ID and deletes the client
   * @param clientId: string
   * @returns: void
   */
  deleteClient(clientId: string): void {
    const client = this.findClientById(clientId);

    if (!client) {
      throw new Error('Client not found');
    }

    this.clients.splice(this.clients.indexOf(client), 1);
  }
}
