import Database from '@lodestar-official/database';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import { NewMarginDto } from './dto/newMargin.dto';
import { queries } from '@/queries';
import { UpdateMarginDto } from './dto/updateMargin.dto';

@Injectable()
export class CustomerSegmentMarginService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async createMargins(marginData: NewMarginDto) {
    const {
      tenant_id,
      customer_segment_id,
      customer_segment_margin_type,
      spending_threshold,
      seniority_months,
      frequency_per_month,
    } = marginData;
    const newMargin = await this.db.query(
      queries.customer_segment_margin.create,
      [
        tenant_id,
        customer_segment_id,
        customer_segment_margin_type,
        spending_threshold,
        seniority_months,
        frequency_per_month,
      ],
    );

    return newMargin;
  }

  async updateMargins(id: string, newMarginData: UpdateMarginDto) {
    const { ...newMargins } = newMarginData;
    const updatedMarginKeys = Object.keys(newMargins).filter(
      (key) => newMargins[key as keyof typeof newMargins] !== undefined,
    );

    if (updatedMarginKeys.length === 0) {
      throw new Error('No valid fields to update');
    }

    let setClause: string[] = [];
    let paramsArray: any[] = [];
    let index = 1;

    for (const key of updatedMarginKeys) {
      const validKey = key as keyof typeof newMargins;
      setClause.push(`${key} = $${index}`);
      paramsArray.push(newMargins[validKey]);
      index++;
    }

    paramsArray.push(id);

    const setString = setClause.join(', ');

    const qString = `
      UPDATE core.customer_segment_margin
      SET ${setString}
      WHERE customer_segment_margin_id = $${index}
    `;
    try {
      const result = await this.db.query(qString, paramsArray);
      return result.rows;
    } catch (error) {
      throw new Error('Error updating margin');
    }
  }

  async getMarginInfo() {
    const marginInfo = await this.db.query(queries.customer_segment_margin.getInfo);
    return marginInfo.rows;
  }

  async deleteMargin(id: string) {
    const deletedMargin = await this.db.query(
      queries.customer_segment_margin.delete,
      [id],
    );
    return deletedMargin;
  }
}
