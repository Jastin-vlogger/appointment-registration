import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';

const mockAppointmentRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  clear: jest.fn(),
};

describe('AppointmentService', () => {
  let service: AppointmentService;
  let controller: AppointmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentController],
      providers: [
        AppointmentService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockAppointmentRepo,
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    controller = module.get<AppointmentController>(AppointmentController);

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
  describe('getAvailableSlots', () => {
    it('should return available slots', async () => {
      mockAppointmentRepo.find.mockResolvedValue([{ timeSlot: '10:00' }, { timeSlot: '11:00' }]);

      const result = await service.getAvailableSlots('2025-03-18');
      expect(result).toEqual([
        '10:30', '11:30', '12:00', '12:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
      ]);
    });
  });

  describe('bookAppointment', () => {
    it('should book an appointment successfully', async () => {
      mockAppointmentRepo.findOne.mockResolvedValue(null);
      mockAppointmentRepo.create.mockReturnValue({ name: 'John Doe', phoneNumber: '1234567890', date: '2025-03-18', timeSlot: '10:00' });
      mockAppointmentRepo.save.mockResolvedValue({ id: 1, name: 'John Doe', phoneNumber: '1234567890', date: '2025-03-18', timeSlot: '10:00' });

      const result = await service.bookAppointment('John Doe', '1234567890', '2025-03-18', '10:00');
      expect(result).toEqual({ id: 1, name: 'John Doe', phoneNumber: '1234567890', date: '2025-03-18', timeSlot: '10:00' });
    });

    it('should throw ConflictException if slot is already booked', async () => {
      mockAppointmentRepo.findOne.mockResolvedValue({});

      await expect(service.bookAppointment('John Doe', '1234567890', '2025-03-18', '10:00'))
        .rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException if save fails', async () => {
      mockAppointmentRepo.findOne.mockResolvedValue(null);
      mockAppointmentRepo.create.mockReturnValue({});
      mockAppointmentRepo.save.mockRejectedValue(new Error('DB Error'));

      await expect(service.bookAppointment('John Doe', '1234567890', '2025-03-18', '10:00'))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteAllAppointments', () => {
    it('should delete all appointments', async () => {
      mockAppointmentRepo.clear.mockResolvedValue(undefined);
      const result = await service.deleteAllAppointments();
      expect(result).toEqual({ message: 'All appointments deleted successfully' });
    });
  });
});