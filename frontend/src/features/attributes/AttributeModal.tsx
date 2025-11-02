import { useForm } from 'react-hook-form';
import { Modal } from '@/components/modal';
import { Button } from '@/components/button';
import { useEntities } from '@/api/hooks';

export interface AttributeFormValues {
  kindId: number | '';
  contextRowId: number | '';
  name: string;
  displayName: string;
  category: string;
  dataType: 'string' | 'real' | 'date' | 'bool' | 'json';
}

interface Props {
  open: boolean;
  kinds: Array<{ rowId: number; kindName: string }>;
  initial?: AttributeFormValues;
  onClose: () => void;
  onSubmit: (values: AttributeFormValues) => Promise<void> | void;
}

export function AttributeModal({ open, kinds, initial, onClose, onSubmit }: Props) {
  const form = useForm<AttributeFormValues>({ defaultValues: initial ?? { kindId: '', contextRowId: '', name: '', displayName: '', category: '', dataType: 'string' } });
  const kindId = form.watch('kindId');
  const { data: contexts = [] } = useEntities(kindId ? Number(kindId) : undefined);
  return (
    <Modal open={open} title={initial ? 'ویرایش ویژگی' : 'افزودن ویژگی'} onClose={onClose} maxWidth="lg">
      <form className="grid gap-3 lg:grid-cols-3" onSubmit={form.handleSubmit(async (v) => { await onSubmit(v); onClose(); })}>
        <div>
          <label className="block text-xs font-medium text-slate-600">نوع موجودیت</label>
          <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" {...form.register('kindId', { required: true, valueAsNumber: true })}>
            <option value="">انتخاب نوع</option>
            {kinds.map((k) => (<option key={k.rowId} value={k.rowId}>{k.kindName}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">موجودیت کانتکست</label>
          <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" {...form.register('contextRowId', { required: true, valueAsNumber: true })} disabled={!kindId}>
            <option value="">انتخاب موجودیت</option>
            {(contexts as any[]).map((e) => (<option key={e.rowId} value={e.rowId}>{e.name} (#{e.rowId})</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">نوع داده</label>
          <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" {...form.register('dataType')}> 
            <option value="string">رشته</option>
            <option value="real">عدد</option>
            <option value="date">تاریخ</option>
            <option value="bool">بلی/خیر</option>
            <option value="json">JSON</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">نام سیستمی</label>
          <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" {...form.register('name', { required: true, minLength: 2 })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">نام نمایشی</label>
          <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" {...form.register('displayName', { required: true, minLength: 2 })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">دسته</label>
          <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" {...form.register('category', { required: true, minLength: 2 })} />
        </div>
        <div className="lg:col-span-3 flex items-center justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose}>انصراف</Button>
          <Button type="submit">ثبت</Button>
        </div>
      </form>
    </Modal>
  );
}

