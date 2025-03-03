import { Collection, Entity, ManyToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { Keyword } from './keyword.entity'
import { Station } from './station.entity'

@Entity()
export class CalendarEvent {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string

  @Property({ type: 'text' })
  name!: string

  @ManyToMany(() => Keyword)
  keywords = new Collection<Keyword>(this)

  @ManyToMany(() => Station)
  stations = new Collection<Station>(this)
}
