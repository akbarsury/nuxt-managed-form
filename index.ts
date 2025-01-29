import { useForm as veeUseForm, useField as veeUseField } from 'vee-validate'
import z, { type ZodType } from 'zod';

export type FormsSchema = Record<string, FormSchema>
type FormSchema = Record<string, ZodType>

type FieldObj<TVal extends string | number | boolean = string, TAttr extends object = {}> = { val: TVal, attr: TAttr }

export class ManagedForm<
    S extends FormsSchema,
    T extends keyof S
> {
    constructor(private schema: S) {
        this.keys = Object.keys(schema) as T[]
        this.forms = Object.assign(Object.fromEntries(
            (this.keys).map((key) => [key, veeUseForm({ validationSchema: toTypedSchema(z.object(this.schema[key])) })])
        ))
    }

    keys: T[] = []
    forms: Record<T, UseForm>
    // method
}

export class UseForm<
    S extends FormSchema = FormSchema,
    KeyOfS extends keyof S = keyof S,
    Fields extends object = Record<KeyOfS, FieldObj>
> {

    constructor(schema: S) {
        this.fieldKeys = Object.keys(schema) as KeyOfS[]
        this.form = useForm({ validationSchema: toTypedSchema(z.object(schema)) })
        Object.assign(this.fields, Object.fromEntries((this.fieldKeys).map((key) => {
            let [x, y] = this.form.defineField(ref(key))
            return [key, { val: x, attr: y }]
        })))
    }

    // property
    form: ReturnType<typeof useForm>;
    private fieldKeys: KeyOfS[] | null = null;
    fields: Fields = reactive({}) as Fields;

    // method
    useField = <T extends KeyOfS>(field: T) => this.form.defineField(ref(field))

}