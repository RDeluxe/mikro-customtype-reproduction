import { Collection, Entity, ManyToMany, PrimaryKey } from '@mikro-orm/core'
import { CalendarEvent } from './event.entity'

@Entity()
export class Keyword {
  @PrimaryKey({ type: 'text' })
  id!: string

  @ManyToMany(() => CalendarEvent, event => event.keywords)
  events = new Collection<CalendarEvent>(this)
}
