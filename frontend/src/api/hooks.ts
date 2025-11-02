import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export function useRuleVariables() {
  return useQuery({
    queryKey: ['rules', 'variables'],
    queryFn: async () => {
      const { data } = await apiClient.get('/rules/variables');
      return data;
    }
  });
}

export function useCreateRuleVariable() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post('/rules/variables', payload);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['rules', 'variables'] });
    }
  });
}

export function useUpdateRuleVariable() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: unknown }) => {
      const { data } = await apiClient.put(`/rules/variables/${id}`, payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'variables'] })
  });
}

export function useDeleteRuleVariable() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete(`/rules/variables/${id}`);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'variables'] })
  });
}

export function useRuleScores() {
  return useQuery({
    queryKey: ['rules', 'scores'],
    queryFn: async () => {
      const { data } = await apiClient.get('/rules/scores');
      return data;
    }
  });
}

export function useCreateRuleScore() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post('/rules/scores', payload);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['rules', 'scores'] });
    },
    onError: (error: any) => {
      window.alert(error?.response?.data?.message ?? 'خطا در ثبت فرمول');
    }
  });
}

export function usePublishRuleScore() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (scoreId: number) => {
      const { data } = await apiClient.post(`/rules/scores/${scoreId}/publish`);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['rules', 'scores'] });
    },
    onError: (error: any) => {
      window.alert(error?.response?.data?.message ?? 'انتشار با خطا مواجه شد');
    }
  });
}

export function useDuplicateRuleScore() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (scoreId: number) => {
      const { data } = await apiClient.post(`/rules/scores/${scoreId}/duplicate`);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['rules', 'scores'] });
    },
    onError: () => {
      window.alert('ایجاد نسخه جدید با خطا مواجه شد');
    }
  });
}

export function useUpdateRuleScore() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: unknown }) => {
      const { data } = await apiClient.put(`/rules/scores/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['rules', 'scores'] });
    }
  });
}

export function useDeleteRuleScore() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete(`/rules/scores/${id}`);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['rules', 'scores'] });
    },
    onError: () => {
      window.alert('حذف فرمول با خطا مواجه شد');
    }
  });
}

export function useRuleSets() {
  return useQuery({
    queryKey: ['rules', 'ruleSets'],
    queryFn: async () => {
      const { data } = await apiClient.get('/rules/rule-sets');
      return data;
    }
  });
}

// Scores advanced (variables + options)
export function useScoreVariables(scoreId: number | undefined) {
  return useQuery({
    queryKey: ['rules', 'scores', scoreId, 'variables'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/rules/scores/${scoreId}/variables`);
      return data as { variableIds: number[] };
    },
    enabled: Boolean(scoreId)
  });
}

export function useSetScoreVariables(scoreId: number | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { variableIds: number[] }) => {
      const { data } = await apiClient.put(`/rules/scores/${scoreId}/variables`, payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'scores', scoreId, 'variables'] })
  });
}

export function useScoreOptions(scoreId: number | undefined) {
  return useQuery({
    queryKey: ['rules', 'scores', scoreId, 'options'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/rules/scores/${scoreId}/options`);
      return data as Array<{ rowId: number; composition: string; value: number }>;
    },
    enabled: Boolean(scoreId)
  });
}

export function useReplaceScoreOptions(scoreId: number | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { rows: Array<{ composition: string; value: number }> }) => {
      const { data } = await apiClient.put(`/rules/scores/${scoreId}/options`, payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'scores', scoreId, 'options'] })
  });
}

export function useVariableFacts(variableId: number | undefined) {
  return useQuery({
    queryKey: ['rules', 'variables', variableId, 'facts'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/rules/variables/${variableId}/facts`);
      return data as { factIds: number[] };
    },
    enabled: Boolean(variableId)
  });
}

export function useSetVariableFacts(variableId: number | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { factIds: number[] }) => {
      const { data } = await apiClient.put(`/rules/variables/${variableId}/facts`, payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'variables', variableId, 'facts'] })
  });
}

export function useVariableOptions(variableId: number | undefined) {
  return useQuery({
    queryKey: ['rules', 'variables', variableId, 'options'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/rules/variables/${variableId}/options`);
      return data as Array<{ rowId: number; composition: string; value: string }>;
    },
    enabled: Boolean(variableId)
  });
}

export function useReplaceVariableOptions(variableId: number | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { rows: Array<{ composition: string; value: string }> }) => {
      const { data } = await apiClient.put(`/rules/variables/${variableId}/options`, payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'variables', variableId, 'options'] })
  });
}

export function useCreateRuleSet() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post('/rules/rule-sets', payload);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['rules', 'ruleSets'] });
    },
    onError: () => {
      window.alert('ثبت مجموعه قوانین با خطا مواجه شد');
    }
  });
}

export function useAttributes(kindId?: number) {
  return useQuery({
    queryKey: ['attributes', kindId],
    queryFn: async () => {
      const params = kindId !== undefined ? { kindId } : undefined;
      const { data } = await apiClient.get('/attributes', { params });
      return data;
    }
  });
}

export function useAttributeCategories() {
  return useQuery({
    queryKey: ['attributes', 'categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/attributes/categories');
      return data;
    }
  });
}

export function useEntityKinds() {
  return useQuery({
    queryKey: ['attributes', 'entityKinds'],
    queryFn: async () => {
      const { data } = await apiClient.get('/attributes/entity-kinds');
      return data;
    }
  });
}

export function useCreateEntityKind() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post('/attributes/entity-kinds', payload);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['attributes', 'entityKinds'] });
    },
    onError: (error: any) => {
      window.alert(error?.response?.data?.message ?? 'Failed to create entity kind.');
    }
  });
}

export function useUpdateEntityKind() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: unknown }) => {
      const { data } = await apiClient.put(`/attributes/entity-kinds/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['attributes', 'entityKinds'] });
    }
  });
}

export function useDeleteEntityKind() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete(`/attributes/entity-kinds/${id}`);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['attributes', 'entityKinds'] });
    }
  });
}

export function useEntities(kindId?: number) {
  return useQuery({
    queryKey: ['attributes', 'entities', kindId],
    queryFn: async () => {
      const params = kindId !== undefined ? { kindId } : undefined;
      const { data } = await apiClient.get('/attributes/entities', { params });
      return data;
    },
    enabled: kindId === undefined || !Number.isNaN(kindId)
  });
}

export function useCreateEntity() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post('/attributes/entities', payload);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['attributes', 'entities'] });
    },
    onError: (error: any) => {
      window.alert(error?.response?.data?.message ?? 'Failed to create entity.');
    }
  });
}

export function useUpdateEntity() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: unknown }) => {
      const { data } = await apiClient.put(`/attributes/entities/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['attributes', 'entities'] });
    }
  });
}

export function useDeleteEntity() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete(`/attributes/entities/${id}`);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['attributes', 'entities'] });
    }
  });
}

export function useCreateAttribute() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post('/attributes', payload);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['attributes'] });
    },
    onError: (error: any) => {
      window.alert(error?.response?.data?.message ?? 'ایجاد ویژگی جدید با خطا مواجه شد');
    }
  });
}

export function useUpdateAttribute() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: unknown }) => {
      const { data } = await apiClient.put(`/attributes/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['attributes'] });
    },
    onError: (error: any) => {
      window.alert(error?.response?.data?.message ?? 'به‌روزرسانی ویژگی با خطا مواجه شد');
    }
  });
}

export function useDeleteAttribute() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete(`/attributes/${id}`);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['attributes'] });
    },
    onError: () => {
      window.alert('حذف ویژگی با خطا مواجه شد');
    }
  });
}

export function useAttributeHistory(attributeId: number | undefined, entityId: number | undefined) {
  return useQuery({
    queryKey: ['attributes', 'history', attributeId, entityId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/attributes/${attributeId}/history/${entityId}`);
      return data;
    },
    enabled: Boolean(attributeId && entityId)
  });
}

export function useAttributeOptions(attributeId: number | undefined) {
  return useQuery({
    queryKey: ['attributes', 'options', attributeId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/attributes/${attributeId}/options`);
      return data;
    },
    enabled: Boolean(attributeId)
  });
}

export function useCreateAttributeOption(attributeId: number | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { value: string }) => {
      const { data } = await apiClient.post(`/attributes/${attributeId}/options`, payload);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['attributes', 'options', attributeId] });
    }
  });
}

export function useUpdateAttributeOption(attributeId: number | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ optionId, value }: { optionId: number; value: string }) => {
      const { data } = await apiClient.put(`/attributes/options/${optionId}`, { value });
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['attributes', 'options', attributeId] });
    }
  });
}

export function useDeleteAttributeOption(attributeId: number | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (optionId: number) => {
      const { data } = await apiClient.delete(`/attributes/options/${optionId}`);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['attributes', 'options', attributeId] });
    }
  });
}

export function usePersonnelList() {
  return useQuery({
    queryKey: ['personnel'],
    queryFn: async () => {
      const { data } = await apiClient.get('/personnel');
      return data;
    }
  });
}

export function usePersonnelDetail(id: number) {
  return useQuery({
    queryKey: ['personnel', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/personnel/${id}`);
      return data;
    },
    enabled: Boolean(id)
  });
}

export function usePersonnelDetailByMember(id: number, memberRowId: number | null) {
  return useQuery({
    queryKey: ['personnel', id, 'member', memberRowId ?? 0],
    queryFn: async () => {
      const params = memberRowId ? { memberRowId } : undefined;
      const { data } = await apiClient.get(`/personnel/${id}`, { params });
      return data;
    },
    enabled: Boolean(id)
  });
}

export function useCreatePerson() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post('/personnel', payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['personnel'] })
  });
}

export function useEntityMembers(entityId: number | null) {
  return useQuery({
    queryKey: ['personnel', entityId, 'members'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/personnel/${entityId}/members`);
      return data as Array<{ rowId: number; randId: string | null }>;
    },
    enabled: Boolean(entityId)
  });
}

export function useAddEntityMember(entityId: number | null) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/personnel/${entityId}/members`);
      return data as { rowId: number; randId: string | null };
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['personnel', entityId, 'members'] });
    }
  });
}

export function useUpsertPersonAttribute(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.put(`/personnel/${id}/attributes`, payload);
      return data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['personnel', id] });
      client.invalidateQueries({ queryKey: ['personnel', id, 'member'] });
    }
  });
}

export function useCalcHokm(personId: number | null) {
  return useMutation({
    mutationFn: async ({ year }: { year: number }) => {
      const { data } = await apiClient.post(`/personnel/${personId}/hokm`, { year });
      return data as Array<{ itemName: string; itemRandId: string; points: number | null; amountRial: number | null }>;
    }
  });
}

export function useUpsertPersonVariable(personId: number | null) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { variableRowId: number; optionRowId: number; startTime?: string; endTime?: string; updatedBy?: string }) => {
      const { data } = await apiClient.put(`/personnel/${personId}/variables`, payload);
      return data;
    },
    onSuccess: () => {
      if (personId) {
        client.invalidateQueries({ queryKey: ['personnel', personId] });
        client.invalidateQueries({ queryKey: ['personnel', personId, 'member'] });
      }
    }
  });
}

export function useDecreePreview() {
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post('/decrees/preview', payload);
      return data;
    }
  });
}

export function useFinalizeDecree() {
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post('/decrees', payload);
      return data;
    }
  });
}

export function useDecreeArchive(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['archive', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/archive', { params });
      return data;
    }
  });
}

export function useCompareDecrees(leftId?: number, rightId?: number) {
  return useQuery({
    queryKey: ['archive', 'compare', leftId, rightId],
    queryFn: async () => {
      const { data } = await apiClient.get('/archive/compare', {
        params: { leftId, rightId }
      });
      return data;
    },
    enabled: Boolean(leftId && rightId)
  });
}

export function useReportDecrees() {
  return useQuery({
    queryKey: ['reports', 'decrees'],
    queryFn: async () => {
      const { data } = await apiClient.get('/reports/decrees');
      return data;
    }
  });
}

export function useReportSalaryDistribution() {
  return useQuery({
    queryKey: ['reports', 'distribution'],
    queryFn: async () => {
      const { data } = await apiClient.get('/reports/salary-distribution');
      return data;
    }
  });
}

export function useReportAlerts() {
  return useQuery({
    queryKey: ['reports', 'alerts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/reports/alerts');
      return data;
    }
  });
}

// Items CRUD
export function useItems() {
  return useQuery({
    queryKey: ['rules', 'items'],
    queryFn: async () => {
      const { data } = await apiClient.get('/rules/items');
      return data as Array<{ rowId: number; name: string; description?: string; valueMin?: number | null; valueMax?: number | null; valueDefault?: number | null }>;
    }
  });
}

export function useCreateItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post('/rules/items', payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'items'] })
  });
}

export function useUpdateItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: unknown }) => {
      const { data } = await apiClient.put(`/rules/items/${id}`, payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'items'] })
  });
}

export function useDeleteItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete(`/rules/items/${id}`);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'items'] })
  });
}

export function useScoreItemRatios(scoreId: number | undefined) {
  return useQuery({
    queryKey: ['rules', 'scores', scoreId, 'itemsRatio'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/rules/scores/${scoreId}/items-ratio`);
      return data as Array<{ itemRowId: number; value: number | null }>;
    },
    enabled: Boolean(scoreId)
  });
}

export function useReplaceScoreItemRatios(scoreId: number | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { rows: Array<{ itemRowId: number; value: number }> }) => {
      const { data } = await apiClient.put(`/rules/scores/${scoreId}/items-ratio`, payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'scores', scoreId, 'itemsRatio'] })
  });
}

export function useVariableItemRatios(variableId: number | undefined) {
  return useQuery({
    queryKey: ['rules', 'variables', variableId, 'itemsRatio'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/rules/variables/${variableId}/items-ratio`);
      return data as Array<{ itemRowId: number; value: number | null }>;
    },
    enabled: Boolean(variableId)
  });
}

export function useReplaceVariableItemRatios(variableId: number | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { rows: Array<{ itemRowId: number; value: number }> }) => {
      const { data } = await apiClient.put(`/rules/variables/${variableId}/items-ratio`, payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'variables', variableId, 'itemsRatio'] })
  });
}

export function useItemVariableRatios(itemId: number | undefined) {
  return useQuery({
    queryKey: ['rules', 'items', itemId, 'variablesRatio'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/rules/items/${itemId}/variables-ratio`);
      return data as Array<{ variableRowId: number; value: number | null }>;
    },
    enabled: Boolean(itemId)
  });
}

export function useReplaceItemVariableRatios(itemId: number | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { rows: Array<{ variableRowId: number; value: number }> }) => {
      const { data } = await apiClient.put(`/rules/items/${itemId}/variables-ratio`, payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'items', itemId, 'variablesRatio'] })
  });
}

export function useItemScoreRatios(itemId: number | undefined) {
  return useQuery({
    queryKey: ['rules', 'items', itemId, 'scoresRatio'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/rules/items/${itemId}/scores-ratio`);
      return data as Array<{ scoreRowId: number; value: number | null }>;
    },
    enabled: Boolean(itemId)
  });
}

export function useReplaceItemScoreRatios(itemId: number | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { rows: Array<{ scoreRowId: number; value: number }> }) => {
      const { data } = await apiClient.put(`/rules/items/${itemId}/scores-ratio`, payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'items', itemId, 'scoresRatio'] })
  });
}
// Auths
export function useAuths() {
  return useQuery({
    queryKey: ['rules', 'auths'],
    queryFn: async () => {
      const { data } = await apiClient.get('/rules/auths');
      return data as Array<{ rowId: number; name: string; description?: string; percent?: number | null }>;
    }
  });
}

export function useCreateAuth() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post('/rules/auths', payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'auths'] })
  });
}

export function useUpdateAuth() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: unknown }) => {
      const { data } = await apiClient.put(`/rules/auths/${id}`, payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'auths'] })
  });
}

export function useDeleteAuth() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete(`/rules/auths/${id}`);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'auths'] })
  });
}

export function useAuthItems(authId: number | undefined) {
  return useQuery({
    queryKey: ['rules', 'auths', authId, 'items'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/rules/auths/${authId}/items`);
      return data as { itemIds: number[] };
    },
    enabled: Boolean(authId)
  });
}

export function useSetAuthItems(authId: number | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { itemIds: number[] }) => {
      const { data } = await apiClient.put(`/rules/auths/${authId}/items`, payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'auths', authId, 'items'] })
  });
}

// Hokm
export function useHokmYears() {
  return useQuery({
    queryKey: ['rules', 'hokm', 'years'],
    queryFn: async () => {
      const { data } = await apiClient.get('/rules/hokm/years');
      return data as Array<{ rowId: number; year: number; yearpercent: number }>;
    }
  });
}

export function useCreateHokmYear() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post('/rules/hokm/years', payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'hokm', 'years'] })
  });
}

export function useUpdateHokmYear() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: unknown }) => {
      const { data } = await apiClient.put(`/rules/hokm/years/${id}`, payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'hokm', 'years'] })
  });
}

export function useDeleteHokmYear() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete(`/rules/hokm/years/${id}`);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'hokm', 'years'] })
  });
}

export function useHokmTypes() {
  return useQuery({
    queryKey: ['rules', 'hokm', 'types'],
    queryFn: async () => {
      const { data } = await apiClient.get('/rules/hokm/types');
      return data as Array<{ rowId: number; title: string }>;
    }
  });
}

export function useCreateHokmType() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await apiClient.post('/rules/hokm/types', payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'hokm', 'types'] })
  });
}

export function useUpdateHokmType() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: unknown }) => {
      const { data } = await apiClient.put(`/rules/hokm/types/${id}`, payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'hokm', 'types'] })
  });
}

export function useDeleteHokmType() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete(`/rules/hokm/types/${id}`);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'hokm', 'types'] })
  });
}

export function useHokmTypeItems(hokmTypeId: number | undefined) {
  return useQuery({
    queryKey: ['rules', 'hokm', 'types', hokmTypeId, 'items'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/rules/hokm/types/${hokmTypeId}/items`);
      return data as Array<{ itemRowId: number; percent: number | null }>;
    },
    enabled: Boolean(hokmTypeId)
  });
}

export function useReplaceHokmTypeItems(hokmTypeId: number | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { rows: Array<{ itemRowId: number; percent: number }> }) => {
      const { data } = await apiClient.put(`/rules/hokm/types/${hokmTypeId}/items`, payload);
      return data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['rules', 'hokm', 'types', hokmTypeId, 'items'] })
  });
}
