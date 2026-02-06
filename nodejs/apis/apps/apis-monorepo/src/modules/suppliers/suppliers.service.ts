import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier, SupplierDocument } from './schemas/supplier.schema';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import {
  SupplierResponseDto,
  SuppliersByUnitResponseDto,
} from './dto/supplier-response.dto';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(
    @InjectModel(Supplier.name)
    private supplierModel: Model<SupplierDocument>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<SupplierResponseDto> {
    const supplier = new this.supplierModel(createSupplierDto);
    const saved = await supplier.save();
    return this.toResponseDto(saved);
  }

  async findAll(
    unitId?: string,
    estado?: string,
  ): Promise<SupplierResponseDto[]> {
    const query: any = {};

    if (unitId) {
      query.unitId = unitId;
    }

    if (estado) {
      query.estado = estado;
    }

    const suppliers = await this.supplierModel
      .find(query)
      .sort({ description: 1 })
      .exec();

    return suppliers.map((supplier) => this.toResponseDto(supplier));
  }

  async findByUnitId(unitId: string): Promise<SuppliersByUnitResponseDto> {
    this.logger.log(`Buscando fornecedores para unitId: ${unitId}`);

    const suppliers = await this.supplierModel
      .find({ unitId })
      .sort({ description: 1 })
      .exec();

    return {
      unitId,
      total: suppliers.length,
      data: suppliers.map((supplier) => this.toResponseDto(supplier)),
    };
  }

  async findOne(id: string): Promise<SupplierResponseDto> {
    const supplier = await this.supplierModel.findById(id).exec();

    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    return this.toResponseDto(supplier);
  }

  async update(
    id: string,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<SupplierResponseDto> {
    const supplier = await this.supplierModel
      .findByIdAndUpdate(
        id,
        { ...updateSupplierDto, updatedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    return this.toResponseDto(supplier);
  }

  async remove(id: string): Promise<void> {
    const result = await this.supplierModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Fornecedor não encontrado');
    }
  }

  async seedSuppliers(
    unitId: string,
    suppliersData: CreateSupplierDto[],
  ): Promise<SuppliersByUnitResponseDto> {
    this.logger.log(`Semeando ${suppliersData.length} fornecedores para unitId: ${unitId}`);

    // Primeiro remove fornecedores existentes desta unidade
    await this.supplierModel.deleteMany({ unitId }).exec();

    // Insere os novos fornecedores
    const suppliersWithUnitId = suppliersData.map((s) => ({ ...s, unitId }));
    const created = await this.supplierModel.insertMany(suppliersWithUnitId);

    return {
      unitId,
      total: created.length,
      data: created.map((supplier) => this.toResponseDto(supplier)),
    };
  }

  private toResponseDto(supplier: any): SupplierResponseDto {
    return {
      id: supplier._id?.toString() || supplier.id,
      unitId: supplier.unitId,
      estado: supplier.estado,
      description: supplier.description,
      website: supplier.website,
      instagram: supplier.instagram,
      createdAt: supplier.createdAt,
      listingDescription: supplier.listingDescription,
      localizacao: supplier.localizacao,
      cnpj: supplier.cnpj,
      genero: supplier.genero,
      tamanho: supplier.tamanho,
      estilo: supplier.estilo,
      pageNum: supplier.pageNum,
      subpage: supplier.subpage,
      createdAtDoc: supplier.createdAt,
      updatedAtDoc: supplier.updatedAt,
    };
  }
}
