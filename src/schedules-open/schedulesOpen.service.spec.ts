import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { SchedulesOpenService } from './schedulesOpen.service';
import { ScheduleOpen } from './entities/scheduleOpen.entity';
import { CreateScheduleOpenDto } from './dto/createScheduleOpendto';
import { UpdateScheduleOpenDto } from './dto/updateScheduleOpendto';
import { IssuesOpenService } from '../issue-open/issueOpen.service';
import { CreateIssueOpendto } from '../issue-open/dto/createIssueOpendto';

describe('SchedulesOpenService', () => {
  let schedulesOpenService: SchedulesOpenService;
  let schedulesRepository: Repository<ScheduleOpen>;

  const mockUuid = uuid();

  const mockCreateScheduleDto: CreateScheduleOpenDto = {
    issue_id: '123',
    alerts: [
      new Date('2022-12-17T17:55:20.565'),
      new Date('2022-12-18T18:55:20.565'),
    ],
    description: 'Uma descrição valida',
    status_e: 'PROGRESS',
    dateTime: new Date('2022-12-17T17:55:20.565'),
  };
  const mockUpdateScheduleDto: UpdateScheduleOpenDto = {
    issue_id: '123',
    description: 'Outra descrição valida',
    status_e: 'CLOSED',
    alerts: [new Date('2022-12-19T19:55:20.565')],
    dateTime: new Date('2022-12-17T17:55:20.565'),
  };

  const schedulesEntityList = [
    { ...mockCreateScheduleDto, ...mockUpdateScheduleDto },
  ];

  const mockCreateIssueOpendto: CreateIssueOpendto = {
    requester: 'Mockerson',
    phone: '61988554474',
    city_id: 'Brasilia',
    workstation_id: 'DF',
    problem_category_id: 'Category Mock',
    problem_types_ids: ['Type Mock'],
    date: new Date(),
    email: 'mockerson@mock.com',
    cellphone: '',
    description: '',
    dateTime: undefined,
    alerts: [],
    isHomolog: false,
  };

  const mockIssuesOpenService = {
    createIssue: jest.fn((dto) => {
      return {
        ...dto,
      };
    }),
    findIssuesOpen: jest.fn(() => {
      return [{ ...mockCreateIssueOpendto }];
    }),
    findIssueOpenById: jest.fn((id) => {
      return {
        id,
        ...mockCreateIssueOpendto,
      };
    }),
    updateIssueOpen: jest.fn((dto, id) => {
      return {
        ...dto,
        id,
      };
    }),
    deleteIssueOpen: jest.fn(() => {
      return {
        message: 'Chamado removido com sucesso',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulesOpenService,
        IssuesOpenService,
        {
          provide: getRepositoryToken(ScheduleOpen),
          useValue: {
            create: jest.fn((dto: CreateScheduleOpenDto) => {
              return {
                id: uuid(),
                ...dto,
              };
            }),
            find: jest.fn().mockResolvedValue(schedulesEntityList),
            findOne: jest.fn().mockResolvedValue(schedulesEntityList[0]),
            delete: jest.fn(() => {
              return { affected: 1 };
            }),
            findOneBy: jest.fn().mockResolvedValue(mockUpdateScheduleDto),
            save: jest.fn(),
          },
        },
      ],
    })
      .overrideProvider(IssuesOpenService)
      .useValue(mockIssuesOpenService)
      .compile();

    schedulesOpenService =
      module.get<SchedulesOpenService>(SchedulesOpenService);
    schedulesRepository = module.get<Repository<ScheduleOpen>>(
      getRepositoryToken(ScheduleOpen),
    );
  });

  it('should be defined', () => {
    expect(schedulesOpenService).toBeDefined();
    expect(schedulesRepository).toBeDefined();
  });

  describe('createScheduleOpen', () => {
    const dto = mockCreateScheduleDto;

    it('should create a schedule with success', async () => {
      const response = await schedulesOpenService.createScheduleOpen(dto);
      expect(response).toHaveProperty('id');
    });

    it('should throw an internal server error when schedule cannot be saved', async () => {
      jest
        .spyOn(schedulesRepository, 'save')
        .mockRejectedValueOnce(new Error());

      expect(
        schedulesOpenService.createScheduleOpen({ ...dto }),
      ).rejects.toThrowError(InternalServerErrorException);
    });
  });

  describe('updateSchedule', () => {
    const dto = mockUpdateScheduleDto;
    const id = uuid();
    it('should update a schedule with success', async () => {
      const response = await schedulesOpenService.updateScheduleOpen(dto, id);
      expect(response).toMatchObject({ ...mockUpdateScheduleDto });
    });

    it('should throw an internal server error when schedule cannot be updated', () => {
      jest
        .spyOn(schedulesRepository, 'save')
        .mockRejectedValueOnce(new Error());

      expect(
        schedulesOpenService.updateScheduleOpen(dto, id),
      ).rejects.toThrowError(InternalServerErrorException);
    });
  });

  describe('findSchedules', () => {
    it('should return a schedule entity list successfully', async () => {
      const response = await schedulesOpenService.findSchedulesOpen();

      expect(response).toEqual(schedulesEntityList);
      expect(schedulesRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception', async () => {
      jest.spyOn(schedulesRepository, 'find').mockResolvedValueOnce(null);

      expect(schedulesOpenService.findSchedulesOpen()).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('findScheduleById', () => {
    const id = mockUuid;

    it('should return a schedule entity successfully', async () => {
      const response = await schedulesOpenService.findScheduleOpenById(id);

      expect(response).toEqual(schedulesEntityList[0]);
    });

    it('should throw a not found exception', () => {
      jest.spyOn(schedulesRepository, 'findOne').mockResolvedValueOnce(null);

      expect(
        schedulesOpenService.findScheduleOpenById(id),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('deleteSchedule', () => {
    it('should return a not found exception', () => {
      const id = mockUuid;

      jest
        .spyOn(schedulesRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as DeleteResult);
      expect(schedulesOpenService.deleteScheduleOpen(id)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
