import { useForm } from 'react-hook-form';
import { Modal } from '@/components/modal';
import { Button } from '@/components/button';

export interface KindFormValues { kindName: string }

interface Props {
  open: boolean;
  initial?: KindFormValues;
  onClose: () => void;
  onSubmit: (values: KindFormValues) => Promise<void> | void;
}

export function KindModal({ open, initial, onClose, onSubmit }: Props) {
  const form = useForm<KindFormValues>({ defaultValues: initial ?? { kindName: '' } });
  return (
    <Modal open={open} title={initial ? 'ویرایش نوع موجودیت' : 'افزودن نوع موجودیت'} onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={form.handleSubmit(async (v) => { await onSubmit(v); onClose(); })}
      >
        <div>
          <label className="block text-xs font-medium text-slate-600">عنوان نوع موجودیت</label>
          <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" {...form.register('kindName', { required: true })} />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose}>انصراف</Button>
          <Button type="submit">ثبت</Button>
        </div>
      </form>
    </Modal>
  );
}

