import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { CalendarEvent } from "../entities/event.entity";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    async getHello(): Promise<CalendarEvent> {
        return this.appService.createEvent();
    }

    @Post('update/:id')
    async updateEvent(@Body() payload: any, @Param('id') id: string): Promise<CalendarEvent> {
        return this.appService.updateEvent(payload, id);
    }
}
