import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Workflow } from './workflow.schema'; // Adjust the path if necessary
import { TriggerSnapshot } from '../entities/trigger-snapshot.entity';

@Schema({ timestamps: true })
export class WorkflowInstance extends Document {
  
  @Prop({ type: Types.ObjectId, ref: Workflow.name, required: true })
  workflow: Workflow;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ default: 0 })
  currentStepIndex: number;

  @Prop({ type:  Map<string, TriggerSnapshot> })
  triggerSnapshots: Map<string, TriggerSnapshot>;

  @Prop({ type: Date })
  startedAt: Date;

  @Prop({ type: Date })
  completedAt: Date;

  @Prop({ type: Map, of: String })
  params: Map<string, string>;
}

export const WorkflowInstanceSchema = SchemaFactory.createForClass(WorkflowInstance);
