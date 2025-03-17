import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  date: string; // Format: YYYY-MM-DD

  @Column()
  timeSlot: string; // Format: HH:mm
}
