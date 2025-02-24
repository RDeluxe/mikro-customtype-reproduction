import { Collection, Entity, ManyToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { PointDTO, PointType } from './pointType'
import { CalendarEvent } from './event.entity'

@Entity()
export class Station {
  @PrimaryKey({ type: 'text' })
  name!: string

  @Property({ type: PointType })
  position!: PointDTO

  @Property({ type: 'text' })
  testProperty!: string

  @ManyToMany(() => CalendarEvent, event => event.stations)
  events = new Collection<CalendarEvent>(this)
}
