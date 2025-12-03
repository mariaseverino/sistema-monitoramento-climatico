import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, trusted } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

class Coord {
    @Prop({ required: true })
    lat: number;

    @Prop({ required: true })
    lon: number;
}

@Schema()
export class User {
    @Prop({ required: trusted })
    name: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true, select: false })
    password: string;

    @Prop({ type: Coord, required: true })
    coord: Coord;
}

export const UserSchema = SchemaFactory.createForClass(User);
