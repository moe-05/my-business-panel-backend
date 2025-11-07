import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentType } from './interface/document_type.interface';
import { DATABASE } from '../db/db.provider';
import Database from '@lodestar-official/database';
import { queries } from '@/queries';

@Injectable()
export class DocumentTypeService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}
  //Delete this when the database is implemented

  async findAll(): Promise<DocumentType[]> {
    try {
      const query = await this.db.query(queries.document_type.all);
      return query.rows;
    } catch (error) {
      throw new Error('Error fetching document types');
    }
  }

  /**
   * Gets a document type by its ID
   * @param id: string
   * @returns: DocumentType | undefined
   */
  async findById(id: string): Promise<DocumentType> {
    try {
      const document = await this.db.query(queries.document_type.byId, [id]);
      return document.rows[0];
    } catch (error) {
      throw new Error('Error fetching document type');
    }
  }

  async delete(id: string) {
    try {
      const result = await this.db.query(queries.document_type.delete, [id]);
      return result.rows;
    } catch (error) {
      throw new Error('Error deleting document type');
    }
  }
}
