import { Module } from '@nestjs/common';
import { InsightService } from './insight.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Insight, InsightSchema } from './insight.schema';

@Module({
    providers: [InsightService],
    imports: [
        MongooseModule.forFeature([
            { name: Insight.name, schema: InsightSchema },
        ]),
    ],
    exports: [InsightService],
})
export class InsightModule {}
