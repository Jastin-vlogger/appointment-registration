import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BookAppointmentDto } from './dto/appointment.dto';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get('slots')
  async getAvailableSlots(@Query('date') date: string) {
    if (!date) throw new Error('Date is required');
    return this.appointmentService.getAvailableSlots(date);
  }

  @Post('book')
  @ApiOperation({ summary: 'Book an appointment' })
  @ApiResponse({ status: 201, description: 'Appointment successfully booked' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async bookAppointment(@Body() body: BookAppointmentDto) {
    const { name, phoneNumber, date, timeSlot } = body;
    return this.appointmentService.bookAppointment(
      name,
      phoneNumber,
      date,
      timeSlot,
    );
  }

  @Delete('all')
  async deleteAllAppointments() {
    return this.appointmentService.deleteAllAppointments();
  }
}
