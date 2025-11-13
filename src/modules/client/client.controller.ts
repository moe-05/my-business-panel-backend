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

// ? Implement AuthGuard
//UseGuards(AuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  async findAll() {
    return this.clientsService.getAllClients();
  }

  @Get(':id')
  async findOneClient(@Param('id') id: string) {
    return this.clientsService.findClientById(id);
  }

  @Post()
  async createClient(@Body() request: NewClientDto) {
    return this.clientsService.createClient(request);
  }

  @Post('update/:id')
  async updateClient(
    @Param('id') id: string,
    @Body()
    request: UpdateClientDto,
    @Res() response: Response,
  ) {
    return this.clientsService.updateClient(id, request);
  }

  @Delete(':id')
  async deleteClient(@Param('id') id: string) {
    return this.clientsService.deleteClient(id);
  }
}
