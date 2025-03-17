import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
  ) {}

  async getAvailableSlots(date: string): Promise<string[]> {
    const allSlots = [
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '12:00',
      '12:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
    ];

    const bookedSlots = await this.appointmentRepo
      .find({ where: { date } })
      .then((appointments) => appointments.map((a) => a.timeSlot));

    return allSlots.filter((slot) => !bookedSlots.includes(slot));
  }

  async bookAppointment(
    name: string,
    phoneNumber: string,
    date: string,
    timeSlot: string,
  ): Promise<Appointment> {
    try {
      const existing = await this.appointmentRepo.findOne({
        where: { date, timeSlot },
      });

      if (existing) {
        throw new ConflictException('This time slot is already booked.');
      }

      const appointment = this.appointmentRepo.create({
        name,
        phoneNumber,
        date,
        timeSlot,
      });

      return await this.appointmentRepo.save(appointment);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to book appointment. Please try again.',
      );
    }
  }

  async deleteAllAppointments(): Promise<{ message: string }> {
    await this.appointmentRepo.clear();
    return { message: 'All appointments deleted successfully' };
  }
  
}
