import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database';
import { queries } from '@/queries';
import { PayrollConceptRow } from '../payroll/interface/payroll-db.interface';
import { NewConceptDto } from './dto/newConcept.dto';
import { UpdateConceptDto } from './dto/updateConcept.dto';

@Injectable()
export class ConceptService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getAllConceptsByTenant(tenantId: string): Promise<PayrollConceptRow[]> {
    const concept = await this.db.query(queries.payroll.getConcepts, [
      tenantId,
    ]);

    return concept.rows.length ? concept.rows : [];
  }

  async createNewConcept(data: NewConceptDto) {
    const { tenantId, name, type, calcMethod, isTaxable, baseValue, code } = data;

    const newConcept = await this.db.query(queries.concept.createConcept, [
      tenantId,
      name,
      type,
      calcMethod,
      isTaxable,
      baseValue,
      code
    ]);

    if (newConcept.rows.length === 0) {
      throw new Error('Error creating new concept');
    }

    return {
      message: 'Concept created successfully',
      conceptId: newConcept.rows[0].concept_id,
    };
  }

  async updateConcept(data: UpdateConceptDto, conceptId: number) {
    const existingConcept = await this.db.query(
      queries.concept.getConceptById,
      [conceptId],
    );

    if (existingConcept.rows.length === 0) {
      throw new Error('Concept not found');
    }

    const { name, type, calcMethod, isTaxable, baseValue } = data;

    const updatedConcept = await this.db.query(queries.concept.updateConcept, [
      name,
      type,
      calcMethod,
      isTaxable,
      baseValue,
      conceptId,
    ]);

    if (updatedConcept.rows.length === 0) {
      throw new Error('Error updating concept. Check input data.');
    }

    return {
      message: 'Concept updated successfully',
      concept: updatedConcept.rows[0],
    };
  }

  async softDeleteConcept(conceptId: number) {
    const existingConcept = await this.db.query(
      queries.concept.getConceptById,
      [conceptId],
    );

    if (existingConcept.rows.length === 0) {
      throw new Error('Concept not found');
    }

    const softDeletedConcept = await this.db.query(queries.concept.softDelete, [
      conceptId,
    ]);

    if (softDeletedConcept.rows.length === 0) {
      throw new Error('Error deactivating concept.');
    }

    return {
      message: 'Concept deactivated successfully',
      concept: softDeletedConcept.rows[0],
    };
  }

  async deleteConcept(conceptId: number) {
    const existingConcept = await this.db.query(
      queries.concept.getConceptById,
      [conceptId],
    );

    if (existingConcept.rows.length === 0) {
      throw new Error('Concept not found');
    }
    
    const deletedConcept = await this.db.query(queries.concept.deleteConcept, [
      conceptId,
    ]);

    return {
      message: `Concept with id: ${conceptId} deleted successfully.`,
    };
  }
}
