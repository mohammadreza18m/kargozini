import { useForm } from 'react-hook-form';
import { Modal } from '@/components/modal';
import { Button } from '@/components/button';

export interface EntityFormValues { kindId: number | ''; name: string }

interface Props {
  open: boolean;
  kinds: Array<{ rowId: number; kindName: string }>;
  initial?: EntityFormValues;
  onClose: () => void;
  onSubmit: (values: EntityFormValues) => Promise<void> | void;
}

export function EntityModal({ open, kinds, initial, onClose, onSubmit }: Props) {
  const form = useForm<EntityFormValues>({ defaultValues: initial ?? { kindId: '', name: '' } });
  return (
    <Modal open={open} title={initial ? 'ویرایش موجودیت' : 'افزودن موجودیت'} onClose={onClose}>
      <form className="grid gap-3 sm:grid-cols-2" onSubmit={form.handleSubmit(async (v) => { await onSubmit(v); onClose(); })}>
        <div>
          <label className="block text-xs font-medium text-slate-600">نوع موجودیت</label>
          <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" {...form.register('kindId', { required: true, valueAsNumber: true })}>
            <option value="">انتخاب نوع</option>
            {kinds.map((k) => (<option key={k.rowId} value={k.rowId}>{k.kindName}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">عنوان موجودیت</label>
          <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" {...form.register('name', { required: true })} />
        </div>
        <div className="sm:col-span-2 flex items-center justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose}>انصراف</Button>
          <Button type="submit">ثبت</Button>
        </div>
      </form>
    </Modal>
  );
}

