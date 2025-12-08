import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Training, TrainingDocument } from './schemas/training.schema';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';

@Injectable()
export class TrainingsService {
    constructor(
        @InjectModel(Training.name) private trainingModel: Model<TrainingDocument>,
    ) { }

    async create(createTrainingDto: CreateTrainingDto): Promise<Training> {
        const createdTraining = new this.trainingModel(createTrainingDto);
        return createdTraining.save();
    }

    async findAll(query: any = {}): Promise<Training[]> {
        return this.trainingModel.find(query).sort({ order: 1, createdAt: -1 }).exec();
    }

    async findOne(id: string): Promise<Training> {
        const training = await this.trainingModel.findById(id).exec();
        if (!training) {
            throw new NotFoundException(`Training with ID ${id} not found`);
        }
        return training;
    }

    async findAllByFranchise(franchiseId: string): Promise<Training[]> {
        return this.trainingModel.find({
            $or: [
                { isGlobal: true },
                { franchiseId: franchiseId }
            ]
        }).sort({ order: 1 }).exec();
    }

    async update(id: string, updateTrainingDto: UpdateTrainingDto): Promise<Training> {
        const updatedTraining = await this.trainingModel
            .findByIdAndUpdate(id, updateTrainingDto, { new: true })
            .exec();
        if (!updatedTraining) {
            throw new NotFoundException(`Training with ID ${id} not found`);
        }
        return updatedTraining;
    }

    async remove(id: string): Promise<void> {
        const result = await this.trainingModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Training with ID ${id} not found`);
        }
    }

    async incrementViewCount(id: string): Promise<void> {
        await this.trainingModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();
    }
}
