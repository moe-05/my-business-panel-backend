import { Inject, Injectable } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { StateService } from '../state/state.service';
import Database from '@crane-technologies/database/dist/components/Database';
import { DATABASE } from '../db/db.provider';

@Injectable()
export class PurchaseService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly state: StateService,
  ) {}

  async createPurchaseOrder(createPurchaseDto: CreatePurchaseDto) {
    return 'This action adds a new purchase';
  }

  async threeWayMatching(createPurchaseDto: CreatePurchaseDto) {
    return 'This action performs three-way matching for a purchase';
  }

  async getAllPurchaseOrders() {
    return `This action returns all purchase`;
  }

  async getPurchaseOrderById(id: number) {
    return `This action returns a #${id} purchase`;
  }

  async updatePurchaseOrder(id: number, updatePurchaseDto: UpdatePurchaseDto) {
    return `This action updates a #${id} purchase`;
  }
}
