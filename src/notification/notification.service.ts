import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException,BadRequestException } from '@nestjs/common';
import { Notification } from './notification.entity';
import { PatientProfile } from '../patient/patient.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,

    @InjectRepository(PatientProfile)
    private patientRepo: Repository<PatientProfile>,
  ) {}

async getNotifications(
  userId: number,
) {
  const patient =
    await this.patientRepo.findOne({
      where: {
        user: { id: userId },
      },
    });

  if (!patient) {
    throw new NotFoundException(
      'Patient not found',
    );
  }

  const notifications =
    await this.notificationRepo.find({
      where: {
        patient: {
          id: patient.id,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

  if (notifications.length === 0) {
    throw new NotFoundException(
      'No notifications available',
    );
  }

  return notifications;
}
async markAsRead(
  notificationId: number,
  userId: number,
) {
  const patient =
    await this.patientRepo.findOne({
      where: {
        user: { id: userId },
      },
    });

  if (!patient) {
    throw new NotFoundException(
      'Patient not found',
    );
  }

  const notification =
    await this.notificationRepo.findOne({
      where: {
        id: notificationId,
      },
      relations: ['patient'],
    });

  if (!notification) {
    throw new NotFoundException(
      'Notification not found',
    );
  }

  if (
    notification.patient.id !==
    patient.id
  ) {
    throw new NotFoundException(
      'Unauthorized access',
    );
  }

  if (notification.isRead) {
    throw new BadRequestException(
      'Notification already marked as read',
    );
  }

  notification.isRead = true;

  await this.notificationRepo.save(
    notification,
  );

  return {
    message:
      'Notification marked as read',
  };
}
async markAllAsRead(
  userId: number,
) {
  const patient =
    await this.patientRepo.findOne({
      where: {
        user: { id: userId },
      },
    });

  if (!patient) {
    throw new NotFoundException(
      'Patient not found',
    );
  }

  const notifications =
    await this.notificationRepo.find({
      where: {
        patient: {
          id: patient.id,
        },
        isRead: false,
      },
      relations: ['patient'],
    });

  if (notifications.length === 0) {
    throw new NotFoundException(
      'No unread notifications found',
    );
  }

  for (const notification of notifications) {
    notification.isRead = true;
  }

  await this.notificationRepo.save(
    notifications,
  );

  return {
    message:
      'All notifications marked as read',
  };
}
async getUnreadCount(
  userId: number,
) {
  const patient =
    await this.patientRepo.findOne({
      where: {
        user: { id: userId },
      },
    });

  if (!patient) {
    throw new NotFoundException(
      'Patient not found',
    );
  }

  const count =
    await this.notificationRepo.count({
      where: {
        patient: {
          id: patient.id,
        },
        isRead: false,
      },
    });

  return {
    unreadCount: count,
  };
}
}