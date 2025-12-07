import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherDocument = HydratedDocument<Weather>;

@Schema()
export class Weather {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    time: Date;

    @Prop({ required: true })
    lat: number;

    @Prop({ required: true })
    lon: number;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    temp: number;

    @Prop({ required: true })
    humidity: number;

    @Prop({ required: true })
    windSpeed: number;

    @Prop({ required: true })
    icon: string;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
