import { ClientsService } from './client.service';
import { Client } from './interface/client.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
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

  //TODO: Implement the logic with db connection
  @Get()
  findAll(): Client[] {
    return this.clientsService.getAllClients();
  }

  @Get(':id')
  findOneClient(@Param('id') id: string, @Res() response: Response) {
    const client = this.clientsService.findClientById(id);
    if (!client) {
      response.status(404).send({ message: 'Client not found' });
    }
    return response.json({ client });
  }

  @Post('new')
  createClient(
    @Body() request: NewClientDto,
    @Res() response: Response,
  ) {
    const client = this.clientsService.createClient(request);

    if (!client) {
      return response.status(400).send({ message: 'Error creating client' });
    }

    return response
      .json({ message: 'Client created successfully', client })
      .status(201);
  }

  @Post('update/:id')
  updateClient(
    @Param('id') id: string,
    @Body()
    request: UpdateClientDto,
  ): Client {
    return this.clientsService.updateClient(id, request);
  }

  @Delete(':id')
  deleteClient(@Param('id') id: string): void {
    this.clientsService.deleteClient(id);
  }
}
