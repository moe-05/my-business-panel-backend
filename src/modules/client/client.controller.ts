import { ClientsService } from './client.service';
import { Client } from './interface/client.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { NewClientDto } from './dto/newClient.dto';
import { UpdateClientDto } from './dto/updateClient.dto';

//TODO: Implement AuthGuard
//UseGuards(AuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async findAll() {
    try {
      const allClients = await this.clientsService.getAllClients();
      return allClients;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching clients');
    }
  }

  @Get(':id')
  async findOneClient(@Param('id') id: string, @Res() response: Response) {
    try {
      const client = await this.clientsService.findClientById(id);
      if (!client) {
        response.status(404).send({ message: 'Client not found' });
      }
      return response.json(client);
    } catch (error) {
      throw new InternalServerErrorException('Error fetching client');
    }
  }

  @Post()
  async createClient(@Body() request: NewClientDto, @Res() response: Response) {
    try {
      const client = await this.clientsService.createClient(request);

      if (!client) {
        return response.status(400).send({ message: 'Error creating client' });
      }

      return response
        .json({ message: 'Client created successfully', client })
        .status(201);
    } catch (error) {
      throw new InternalServerErrorException('Error creating client');
    }
  }

  @Post('update/:id')
  async updateClient(
    @Param('id') id: string,
    @Body()
    request: UpdateClientDto,
    @Res() response: Response,
  ) {
    try {
      const updatedClient = await this.clientsService.updateClient(id, request);
      if (!updatedClient) {
        return response.status(400).send({ message: 'Error updating client' });
      }
      return response.json({
        message: 'Client updated successfully',
        client: updatedClient,
      });
    } catch (error) {
      throw new InternalServerErrorException('Error updating client');
    }
  }

  @Delete(':id')
  async deleteClient(@Param('id') id: string, @Res() response: Response) {
    try {
      const deletedClient = await this.clientsService.deleteClient(id);
      if (!deletedClient) {
        return response.status(400).send({ message: 'Error deleting client' });
      }
      return response.json({
        message: 'Client deleted successfully',
        client: deletedClient,
      });
    } catch (error) {
      throw new InternalServerErrorException('Error deleting client');
    }
  }
}
