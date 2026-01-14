import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ingredient, IngredientDocument, IngredientUnit, PurchaseHistoryItem, LossRecord } from '../schemas/ingredient.schema';

export interface CreateIngredientDto {
  name: string;
  unit: IngredientUnit;
  costPrice?: number;
  unitId: string;
  description?: string;
  brand?: string;
  supplierId?: string;
  active?: boolean;
  shelfLifeDays?: number;
}

export interface UpdateIngredientDto {
  name?: string;
  unit?: IngredientUnit;
  costPrice?: number;
  description?: string;
  brand?: string;
  supplierId?: string;
  active?: boolean;
  shelfLifeDays?: number;
}

export interface AddPurchaseDto {
  purchaseDate: Date | string;
  quantity: number;
  unitPrice: number;
  supplierId?: string;
  supplierName?: string;
  expiryDate?: Date | string;
  batchNumber?: string;
  notes?: string;
}

export interface AddLossDto {
  date: Date | string;
  quantity: number;
  reason: 'expired' | 'damaged' | 'spoiled' | 'waste' | 'other';
  notes?: string;
}

@Injectable()
export class IngredientsService {
  constructor(
    @InjectModel(Ingredient.name) private ingredientModel: Model<IngredientDocument>,
  ) {}

  async create(createDto: CreateIngredientDto): Promise<Ingredient> {
    if (createDto.costPrice < 0) {
      throw new BadRequestException('Preço de custo não pode ser negativo');
    }

    const ingredient = new this.ingredientModel({
      ...createDto,
      active: createDto.active !== undefined ? createDto.active : true,
      isDeleted: false,
    });

    return ingredient.save();
  }

  async findAll(unitId: string, includeInactive = false): Promise<Ingredient[]> {
    const query: any = { 
      unitId,
      isDeleted: { $ne: true },
    };

    if (!includeInactive) {
      query.active = true;
    }

    return this.ingredientModel.find(query).sort({ name: 1 }).exec();
  }

  async findOne(id: string, unitId: string): Promise<Ingredient> {
    const ingredient = await this.ingredientModel.findOne({
      _id: id,
      unitId,
      isDeleted: { $ne: true },
    }).exec();

    if (!ingredient) {
      throw new NotFoundException(`Ingrediente com ID ${id} não encontrado`);
    }

    return ingredient;
  }

  async update(id: string, unitId: string, updateDto: UpdateIngredientDto): Promise<Ingredient> {
    if (updateDto.costPrice !== undefined && updateDto.costPrice < 0) {
      throw new BadRequestException('Preço de custo não pode ser negativo');
    }

    const ingredient = await this.ingredientModel.findOneAndUpdate(
      { _id: id, unitId, isDeleted: { $ne: true } },
      { ...updateDto, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();

    if (!ingredient) {
      throw new NotFoundException(`Ingrediente com ID ${id} não encontrado`);
    }

    return ingredient;
  }

  async remove(id: string, unitId: string): Promise<void> {
    const ingredient = await this.ingredientModel.findOneAndUpdate(
      { _id: id, unitId, isDeleted: { $ne: true } },
      { isDeleted: true, updatedAt: new Date() },
      { new: true },
    ).exec();

    if (!ingredient) {
      throw new NotFoundException(`Ingrediente com ID ${id} não encontrado`);
    }
  }

  async findByIds(ids: string[], unitId: string): Promise<Ingredient[]> {
    return this.ingredientModel.find({
      _id: { $in: ids },
      unitId,
      isDeleted: { $ne: true },
      active: true,
    }).exec();
  }

  async addPurchase(id: string, unitId: string, purchaseDto: AddPurchaseDto): Promise<Ingredient> {
    const ingredient = await this.findOne(id, unitId);

    const purchaseItem: PurchaseHistoryItem = {
      purchaseDate: typeof purchaseDto.purchaseDate === 'string' 
        ? new Date(purchaseDto.purchaseDate) 
        : purchaseDto.purchaseDate,
      quantity: purchaseDto.quantity,
      unitPrice: purchaseDto.unitPrice,
      totalPrice: purchaseDto.quantity * purchaseDto.unitPrice,
      supplierId: purchaseDto.supplierId,
      supplierName: purchaseDto.supplierName,
      expiryDate: purchaseDto.expiryDate
        ? (typeof purchaseDto.expiryDate === 'string' ? new Date(purchaseDto.expiryDate) : purchaseDto.expiryDate)
        : undefined,
      batchNumber: purchaseDto.batchNumber,
      notes: purchaseDto.notes,
    };

    // Atualizar preço de custo se o novo preço for diferente
    const newCostPrice = purchaseDto.unitPrice;
    const updatedCostPrice = ingredient.costPrice !== newCostPrice ? newCostPrice : ingredient.costPrice;

    // Atualizar estoque atual
    const currentStock = (ingredient.currentStock || 0) + purchaseDto.quantity;

    const updated = await this.ingredientModel.findByIdAndUpdate(
      id,
      {
        $push: { purchaseHistory: purchaseItem },
        $set: {
          costPrice: updatedCostPrice,
          currentStock: currentStock,
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).exec();

    if (!updated) {
      throw new NotFoundException(`Ingrediente com ID ${id} não encontrado`);
    }

    return updated;
  }

  async addLoss(id: string, unitId: string, lossDto: AddLossDto): Promise<Ingredient> {
    const ingredient = await this.findOne(id, unitId);

    // Calcular custo da perda baseado no preço atual
    const lossCost = (ingredient.costPrice || 0) * lossDto.quantity;

    const lossRecord: LossRecord = {
      date: typeof lossDto.date === 'string' ? new Date(lossDto.date) : lossDto.date,
      quantity: lossDto.quantity,
      reason: lossDto.reason,
      notes: lossDto.notes,
      cost: lossCost,
    };

    // Atualizar estoque atual (reduzir a quantidade perdida)
    const currentStock = Math.max(0, (ingredient.currentStock || 0) - lossDto.quantity);

    const updated = await this.ingredientModel.findByIdAndUpdate(
      id,
      {
        $push: { lossRecords: lossRecord },
        $set: {
          currentStock: currentStock,
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).exec();

    if (!updated) {
      throw new NotFoundException(`Ingrediente com ID ${id} não encontrado`);
    }

    return updated;
  }
}
