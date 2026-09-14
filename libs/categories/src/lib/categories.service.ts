import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Categories, CategoriesDocument } from './categories.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categories.name) private categoriesModel: Model<CategoriesDocument>,
  ) {}

  async getAllCategoriesList(): Promise<CategoriesDocument[]> {
    return this.categoriesModel.find().lean().exec();
  }
}

