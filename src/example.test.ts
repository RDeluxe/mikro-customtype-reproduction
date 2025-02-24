import { MikroORM, wrap } from '@mikro-orm/postgresql';
import { Station } from './entities/station.entity';
import { Keyword } from './entities/keyword.entity';
import { CalendarEvent } from './entities/event.entity';
import config from './mikro-orm.config';
import { AppModule } from './nest-test/app.module';
import { Test } from '@nestjs/testing';
import request from 'supertest';

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    ...config,
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refreshDatabase();
  orm.em.clear();
});

afterAll(async () => {
  await orm.close(true);
});

// This test works
test('custom property test', async () => {
  const uuid = crypto.randomUUID();

  // I'm using raw data here to make the test more readable later
  const station1Dto = { name: 'First Station', position: { latitude: 1, longitude: 1 }, testProperty: 'Test Property 1' }
  const station2Dto = { name: 'Second Station', position: { latitude: 2, longitude: 2 }, testProperty: 'Test Property 2' }
  const station3Dto = { name: 'Third Station', position: { latitude: 3, longitude: 3 }, testProperty: 'Test Property 3' }

  const station1 = orm.em.create(Station, station1Dto);
  const station2 = orm.em.create(Station, station2Dto);
  const station3 = orm.em.create(Station, station3Dto);

  const keyword1Dto = { id: 'keyword1' }
  const keyword2Dto = { id: 'keyword2' }

  const keyword1 = orm.em.create(Keyword, keyword1Dto);
  const keyword2 = orm.em.create(Keyword, keyword2Dto);

  orm.em.create(CalendarEvent, {
    id: uuid,
    name: 'test',
    stations: [station1, station2],
    keywords: [keyword1, keyword2],
  });

  await orm.em.flush();

  // Simulate a new request
  orm.em.clear();

  // I correctly get my custom type (station.position) here
  const event = await orm.em.findOneOrFail(CalendarEvent, { id: uuid }, { populate: ['keywords', 'stations', 'keywords.events', 'stations.events'] });

  expect(event.stations.isInitialized()).toBe(true);
  expect(event.stations.length).toBe(2);
  expect(event.stations.getItems()[0].position).toEqual(station1Dto.position);
  expect(event.stations.getItems()[1].position).toEqual(station2Dto.position);

  wrap(event).assign({ name: 'new event name', stations: ['Second Station'] })
  await orm.em.persistAndFlush(event)
  expect(event.name).toBe('new event name');
  expect(event.stations.length).toBe(1);
  expect(event.stations.getItems()[0].position).toEqual(station2Dto.position);

  wrap(event).assign({ name: 'another event name', stations: ['Second Station', 'Third Station'] })
  await orm.em.persistAndFlush(event)
  expect(event.stations.length).toBe(2);
  expect(event.name).toBe('another event name');

  const updatedEvent = await orm.em.findOneOrFail(CalendarEvent, { id: uuid }, { populate: ['keywords', 'stations', 'keywords.events', 'stations.events'] });
  expect(updatedEvent.stations.getItems()[1].position).toEqual(station3Dto.position);
});

// This test fails
test('nest test', async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleRef.createNestApplication();
  await app.init();

  const event = await request(app.getHttpServer()).get('/');
  const updatedEvent = (await request(app.getHttpServer()).post('/update/' + event.body.id).send({ name: 'new name' })).body;

  expect(updatedEvent.stations.length).toBe(2);
  expect(updatedEvent.stations).toEqual([{ name: 'Station 1', position: { latitude: 1, longitude: 1 }, testProperty: 'Test Property 1' }, { name: 'Station 2', position: { latitude: 2, longitude: 2 }, testProperty: 'Test Property 2' }]);

  const updatedEvent2 = await request(app.getHttpServer()).post('/update/' + event.body.id).send({ stations: ['Station 3'] });

  expect(updatedEvent2.body.stations.length).toBe(1);

  // The station.position property is not hydrated here
  expect(updatedEvent2.body.stations).toEqual([{ name: 'Station 3', position: { latitude: 3, longitude: 3 }, testProperty: 'Test Property 3' }]);

  await app.close();
});