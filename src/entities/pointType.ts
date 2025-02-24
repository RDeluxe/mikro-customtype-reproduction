import { Type } from '@mikro-orm/postgresql'

export type PointDTO = {
    latitude: number;
    longitude: number;
}

export class PointType extends Type<
    PointDTO | undefined,
    string | undefined
> {
    convertToDatabaseValue(value?: PointDTO): string | undefined {
        if (!value)
            return undefined

        return `SRID=4326;POINT(${value.longitude} ${value.latitude})`
    }

    convertToJSValue(value?: string): PointDTO | undefined {
        const m = value?.match(/point\((-?\d+(\.\d+)?) (-?\d+(\.\d+)?)\)/i)

        if (!m)
            return undefined

        return { latitude: +m[1], longitude: +m[3] }
    }

    convertToJSValueSQL(key: string) {
        return `ST_AsText(${key})`
    }

    convertToDatabaseValueSQL(key: string) {
        return `${key}::geometry`
    }

    getColumnType(): string {
        return 'geometry'
    }
}
