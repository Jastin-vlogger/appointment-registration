import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class BookAppointmentDto {
  @ApiProperty({ example: 'John Doe', description: 'Name of the user booking the appointment' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '9876543210', description: 'User phone number', pattern: '^[0-9]{10}$' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' })
  phoneNumber: string;

  @ApiProperty({ example: '2024-03-18', description: 'Date of the appointment (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '10:30 AM', description: 'Time slot for the appointment' })
  @IsString()
  @IsNotEmpty()
  timeSlot: string;
}
