import { useEmailChangeActions } from "./useEmailChangeActions";
import { useEmailChangeDialogState } from "./useEmailChangeDialogState";

export function useEmailChangeDialog(loadProfile: () => Promise<void>) {
  const state = useEmailChangeDialogState();
  const actions = useEmailChangeActions(state, loadProfile);

  return { ...state, ...actions };
}
