import {
  Controller,
  Get,
  Req,
  UseGuards,
  Param,
  Patch
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getNotifications(
    @Req() req,
  ) {
    return this.notificationService.getNotifications(
      req.user.userId,
    );
  }
  @Patch(':id/read')
@UseGuards(AuthGuard('jwt'))
markAsRead(
  @Param('id') id: string,
  @Req() req,
) {
  return this.notificationService.markAsRead(
    +id,
    req.user.userId,
  );
}
@Patch('read-all')
@UseGuards(AuthGuard('jwt'))
markAllAsRead(
  @Req() req,
) {
  return this.notificationService.markAllAsRead(
    req.user.userId,
  );
}
@Get('unread-count')
@UseGuards(AuthGuard('jwt'))
getUnreadCount(
  @Req() req,
) {
  return this.notificationService.getUnreadCount(
    req.user.userId,
  );
}
}