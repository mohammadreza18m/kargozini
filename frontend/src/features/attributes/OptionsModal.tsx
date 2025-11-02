import { Modal } from '@/components/modal';
import { Button } from '@/components/button';
import { DataTable } from '@/components/data-table';
import { useAttributeOptions, useCreateAttributeOption, useUpdateAttributeOption, useDeleteAttributeOption } from '@/api/hooks';

interface Props {
  attributeId?: number;
  attributeName?: string;
  onClose: () => void;
}

export function OptionsModal({ attributeId, attributeName, onClose }: Props) {
  const open = Boolean(attributeId);
  const { data: options = [] } = useAttributeOptions(attributeId);
  const createOption = useCreateAttributeOption(attributeId);
  const updateOption = useUpdateAttributeOption(attributeId);
  const deleteOption = useDeleteAttributeOption(attributeId);
  return (
    <Modal open={open} title={<div><div>گزینه‌های ویژگی</div><div className="text-xs text-slate-500">{attributeName}</div></div>} onClose={onClose} maxWidth="lg">
      <form className="mb-2 flex flex-wrap items-end gap-3" onSubmit={async (e) => {
        e.preventDefault();
        const input = (e.currentTarget.querySelector('input[name="newOption"]') as HTMLInputElement);
        const value = input?.value?.trim();
        if (value) { await createOption.mutateAsync({ value }); input.value = ''; }
      }}>
        <div>
          <label className="block text-xs font-medium text-slate-600">گزینه جدید</label>
          <input name="newOption" className="mt-1 w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
        </div>
        <Button type="submit">افزودن</Button>
      </form>
      <DataTable
        data={options as Array<{ rowId: number; value: string }>}
        columns={[
          { id: 'id', header: 'شناسه', accessor: (i) => i.rowId },
          { id: 'val', header: 'مقدار', accessor: (i) => i.value },
          { id: 'actions', header: 'عملیات', accessor: (i: any) => (
            <div className="flex gap-2 text-xs">
              <Button variant="outline" size="sm" onClick={async () => { const next = window.prompt('ویرایش مقدار گزینه:', i.value); if (next && next !== i.value) await updateOption.mutateAsync({ optionId: i.rowId, value: next }); }}>ویرایش</Button>
              <Button variant="danger" size="sm" onClick={() => window.confirm('حذف این گزینه؟') && deleteOption.mutate(i.rowId)}>حذف</Button>
            </div>
          ) }
        ]}
      />
    </Modal>
  );
}

