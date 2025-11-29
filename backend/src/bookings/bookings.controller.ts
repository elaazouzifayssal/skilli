import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RateSessionDto } from './dto/rate-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.id, dto);
  }

  @Get('my-bookings')
  getMyBookings(@Request() req) {
    return this.bookingsService.getMyBookings(req.user.id);
  }

  @Get('provider-bookings')
  getProviderBookings(@Request() req) {
    return this.bookingsService.getProviderBookings(req.user.id);
  }

  @Put(':id/cancel')
  cancel(@Param('id') id: string, @Request() req) {
    return this.bookingsService.cancel(id, req.user.id);
  }

  @Put(':id/rate')
  rateSession(@Param('id') id: string, @Request() req, @Body() dto: RateSessionDto) {
    return this.bookingsService.rateSession(id, req.user.id, dto);
  }
}
