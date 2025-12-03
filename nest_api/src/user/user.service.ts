import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly user: Model<User>) {}
    async create(createUserDto: CreateUserDto) {
        const newUser = new this.user(createUserDto);
        return newUser.save();
    }

    async findAll() {
        return await this.user.find().exec();
    }

    async findByEmail(email: string) {
        return await this.user.findOne({ email }).select('+password').exec();
    }

    async findOne(id: string) {
        return await this.user.findOne({ id }).exec();
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        return this.user.updateOne({ id }, updateUserDto);
    }

    async remove(id: string) {
        await this.user.deleteOne({ id }).exec();
    }
}
