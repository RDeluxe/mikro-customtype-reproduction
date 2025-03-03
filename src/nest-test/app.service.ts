import { EntityManager, MikroORM, wrap } from "@mikro-orm/postgresql";
import { CalendarEvent } from "../entities/event.entity";
import { Injectable } from "@nestjs/common";
@Injectable()
export class AppService {
    constructor(private readonly em: EntityManager, private readonly orm: MikroORM) { }
    async updateEvent(payload: any, id: string) {
        const event = await this.em.findOneOrFail(CalendarEvent, { id }, { populate: ['keywords', 'stations'] });

        wrap(event).assign(payload);
        await this.em.persistAndFlush(event);

        // Fetching via another query (different where clause) works, the station.position property is hydrated.
        // This actually resolves to another query with joints
        //const updatedEvent = await this.em.findOneOrFail(CalendarEvent, { sourceId: '1' }, { populate: ['keywords', 'stations'] });

        // But this does not work. I can see that a single query is done, to hydrate the stations, but after that the stations properties are still undefined
        // Note that station.testProperty is hydrated, so the problem seem to arise only with custom types
        const updatedEvent = await this.em.findOneOrFail(CalendarEvent, { id }, { populate: ['keywords', 'stations'] });

        return updatedEvent;
    }
}
