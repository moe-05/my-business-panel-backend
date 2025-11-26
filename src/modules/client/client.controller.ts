import { ClientsService } from './client.service';
import { Client } from './interface/client.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { NewClientDto } from './dto/newClient.dto';
import { UpdateClientDto } from './dto/updateClient.dto';

// ? Implement AuthGuard
//UseGuards(AuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async getAll() {
    return this.clientsService.getAllClients();
  }

  @Get(':id')
  async getOneClientById(@Param('id') id: string) {
    return this.clientsService.findClientById(id);
  }

  @Get('/dni/:documentId')
  async getOneClient(@Param('documentId') documentId: string) {
    return this.clientsService.findClientByDocumentId(documentId);
  }

  @Post()
  async createClient(@Body() request: NewClientDto) {
    return this.clientsService.createClient(request);
  }

  @Patch(':id')
  async updateClient(
    @Param('id') id: string,
    @Body()
    request: UpdateClientDto,
  ) {
    return this.clientsService.updateClient(id, request);
  }

  @Delete(':id')
  async deleteClient(@Param('id') id: string) {
    return this.clientsService.deleteClient(id);
  }
}
