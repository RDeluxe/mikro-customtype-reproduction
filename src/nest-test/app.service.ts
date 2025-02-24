import { Collection, EntityManager, MikroORM, wrap } from "@mikro-orm/postgresql";
import { CalendarEvent } from "../entities/event.entity";
import { Station } from "../entities/station.entity";
import { Injectable } from "@nestjs/common";
import { Keyword } from "../entities/keyword.entity";

@Injectable()
export class AppService {
    constructor(private readonly em: EntityManager, private readonly orm: MikroORM) { }

    async createEvent() {
        // cleaning
        await this.orm.schema.refreshDatabase();

        const event = new CalendarEvent();
        event.name = 'Test Event';

        // Create keywords
        const keyword1 = new Keyword();
        keyword1.id = 'keyword1';
        const keyword2 = new Keyword();
        keyword2.id = 'keyword2';
        event.keywords = new Collection<Keyword>(event, [keyword1, keyword2]);

        // Create stations
        const station1 = new Station();
        station1.name = 'Station 1';
        station1.position = { latitude: 1, longitude: 1 };
        station1.testProperty = 'Test Property 1';
        const station2 = new Station();
        station2.name = 'Station 2';
        station2.position = { latitude: 2, longitude: 2 };
        station2.testProperty = 'Test Property 2';
        event.stations = new Collection<Station>(event, [station1, station2]);

        // Create additional station for later use
        const station3 = new Station();
        station3.name = 'Station 3';
        station3.position = { latitude: 3, longitude: 3 };
        station3.testProperty = 'Test Property 3';

        this.em.persist(event);
        this.em.persist(station3);

        // Persist the event (which will cascade persist keywords and stations)
        await this.em.flush();

        return event;
    }

    async updateEvent(payload: any, id: string) {
        const event = await this.em.findOneOrFail(CalendarEvent, { id }, { populate: ['keywords', 'stations'] });

        wrap(event).assign(payload);
        await this.em.persistAndFlush(event);

        // Fetching via another query (different where clause) works, the station.position property is hydrated.
        // This actually resolves to another query with joints
        //const updatedEvent = await this.em.findOneOrFail(CalendarEvent, { sourceId: '1' }, { populate: ['keywords', 'stations'] });

        // But this does not work. I can see that a single query is done, to hydrate the stations, but after that the stations properties
        // Note that station.testProperty is hydrated, so the problem seem to arise only with custom types
        const updatedEvent = await this.em.findOneOrFail(CalendarEvent, { id }, { populate: ['keywords', 'stations'] });

        return updatedEvent;
    }
}
