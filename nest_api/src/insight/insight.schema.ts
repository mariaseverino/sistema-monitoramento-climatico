import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InsightDocument = HydratedDocument<Insight>;

@Schema()
export class Insight {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;
}

export const InsightSchema = SchemaFactory.createForClass(Insight);
