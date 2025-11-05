import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentType } from './interface/document_type.interface';

@Injectable()
export class DocumentTypeService {
  //Delete this when the database is implemented
  private documentTypes: DocumentType[] = [
    {
      document_type_id: '1',
      name: 'passport',
      description: 'International travel document',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      document_type_id: '2',
      name: 'driver_license',
      description: "Government-issued driver's license",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      document_type_id: '3',
      name: 'national_id',
      description: 'National identity card',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  findAll(): DocumentType[] {
    return this.documentTypes;
  }

  /**
   * Gets a document type by its ID
   * @param id: string
   * @returns: DocumentType | undefined
   */
  findById(id: string): DocumentType {
    const documentType = this.documentTypes.find((doc) => doc.document_type_id === id);
    if (!documentType) {
      throw new NotFoundException(`Document type with ID ${id} not found`);
    }
    return documentType;
  }

  delete(id: string): boolean {
    const index = this.documentTypes.findIndex(
      (doc) => doc.document_type_id === id,
    );
    if (index !== -1) {
      this.documentTypes.splice(index, 1);
      return true;
    }
    return false;
  }
}