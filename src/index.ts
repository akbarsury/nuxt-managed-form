import { useForm as veeUseForm, useField as veeUseField } from 'vee-validate'
import type { UnwrapNestedRefs } from 'vue';
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

    constructor(private name: string, schema: S, anyOptions?: Omit<Parameters<typeof useForm>, "name" | "validationSchema">) {
        this.fieldKeys = Object.keys(schema) as KeyOfS[]
        this.form = useForm({ name, validationSchema: toTypedSchema(z.object(schema)), ...anyOptions })
        Object.assign(this.fields, Object.fromEntries((this.fieldKeys).map((key) => {
            let [val, attr] = this.useField(key)
            let errors = computed(() => (this.form as ReturnType<typeof useForm>).errorBag.value[key as string])
            return [key, { val, attr, errors }]
        })))
    }

    // property
    private fieldKeys: KeyOfS[]
    form: Omit<ReturnType<typeof useForm>, "meta" | "values" | "errors" | "errorBag" | "controlledValues">
    meta = computed(() => (this.form as ReturnType<typeof useForm>).meta)
    fields: UnwrapNestedRefs<Fields> = reactive({} as Fields)

    // method
    useField = <T extends KeyOfS>(field: T) => this.form.defineField(ref(field))

}