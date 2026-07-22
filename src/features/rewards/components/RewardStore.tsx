import React, { useState } from 'react';
import { useSignal } from '../../../core/signals';
import { rewardsSignal, childrenSignal, createReward, redeemReward, approveRewardClaim, deleteReward } from '../../../data/app-state-store';
import { Reward } from '../../../domain/entities';
import { Sparkles, Plus, Gift, Trash2, CheckCircle2, ShoppingBag } from 'lucide-react';

interface RewardStoreProps {
  role: 'parent' | 'child';
  childId: string;
}

export default function RewardStore({ role, childId }: RewardStoreProps) {
  const rewards = useSignal(rewardsSignal);
  const children = useSignal(childrenSignal);

  const activeChild = children.find(c => c.id === childId);
  const childRewards = rewards.filter(r => r.childId === childId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState(50);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const handleAddReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !childId) return;

    createReward(childId, title, description, cost);
    setTitle('');
    setDescription('');
    setCost(50);
    setShowAddForm(false);
  };

  const handleRedeem = (id: string) => {
    setRedeemError(null);
    const res = redeemReward(id);
    if (!res.success) {
      setRedeemError(res.error || 'Falha ao resgatar recompensa');
      setTimeout(() => setRedeemError(null), 3000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs animate-in fade-in duration-300" id="reward-store-panel">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Gift className="h-4 w-4 text-pink-500" />
            Loja de Recompensas
          </h3>
          <p className="text-[11px] text-slate-500">Troque as moedas conquistadas por prêmios</p>
        </div>

        {role === 'parent' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 rounded-xl transition-all shadow-md shadow-pink-600/10"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo Prêmio
          </button>
        )}
      </div>

      {redeemError && (
        <div className="mb-3 p-2.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-100 rounded-xl animate-bounce">
          ⚠️ {redeemError}
        </div>
      )}

      {showAddForm && role === 'parent' && (
        <form onSubmit={handleAddReward} className="mb-5 p-4 border border-pink-100 dark:border-pink-950/40 bg-pink-50/20 dark:bg-pink-950/10 rounded-xl space-y-3.5 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Nome do Prêmio</label>
              <input
                type="text"
                required
                placeholder="Ex: Passear no shopping, 1 hora extra de tablet"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Descrição</label>
              <input
                type="text"
                placeholder="Ex: Direito a assistir um filme extra com pipoca."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Preço (💰 Moedas)</label>
              <input
                type="number"
                min={10}
                required
                value={cost}
                onChange={e => setCost(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold bg-pink-600 hover:bg-pink-700 text-white rounded-lg"
            >
              Adicionar Prêmio
            </button>
          </div>
        </form>
      )}

      {childRewards.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p className="text-2xl mb-1">🎁</p>
          <p className="text-xs">Nenhum prêmio cadastrado nesta loja.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {childRewards.map((reward) => {
            const canAfford = activeChild ? activeChild.coins >= reward.costCoins : false;
            const isPendingApproval = reward.isRedeemed && !reward.isApproved;

            return (
              <div
                key={reward.id}
                className={`p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 hover:shadow-xs ${
                  reward.isApproved
                    ? 'bg-slate-50/60 dark:bg-slate-900/40 opacity-75'
                    : isPendingApproval
                    ? 'bg-pink-50/20 dark:bg-pink-950/10 border-pink-100 dark:border-pink-900/30'
                    : 'bg-white dark:bg-slate-900/10'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                      {reward.title}
                    </span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg flex items-center gap-0.5 shrink-0">
                      💰 {reward.costCoins}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed mb-3.5">
                    {reward.description}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100/60 dark:border-slate-800/60">
                  {role === 'child' ? (
                    reward.isApproved ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Entregue
                      </span>
                    ) : reward.isRedeemed ? (
                      <span className="text-[10px] font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-2.5 py-1 rounded-lg">
                        Aguardando Pai ⌛
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRedeem(reward.id)}
                        disabled={!canAfford}
                        className={`w-full py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 shadow-xs transition-all ${
                          canAfford
                            ? 'bg-pink-500 hover:bg-pink-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Resgatar Prêmio
                      </button>
                    )
                  ) : (
                    // Parent View controls
                    reward.isApproved ? (
                      <div className="flex justify-between w-full items-center">
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">
                          Aprovado e Entregue!
                        </span>
                        <button
                          onClick={() => deleteReward(reward.id)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : isPendingApproval ? (
                      <button
                        onClick={() => approveRewardClaim(reward.id)}
                        className="w-full py-1.5 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 rounded-lg transition-colors shadow-md shadow-pink-600/15"
                      >
                        Aprovar e Entregar
                      </button>
                    ) : (
                      <div className="flex justify-between w-full items-center">
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                          Disponível para Resgate
                        </span>
                        <button
                          onClick={() => deleteReward(reward.id)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
