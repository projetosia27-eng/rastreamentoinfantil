import React, { useState } from 'react';
import { useSignal } from '../../../core/signals';
import { tasksSignal, childrenSignal, createTask, completeTask, approveTask, deleteTask } from '../../../data/app-state-store';
import { Task } from '../../../domain/entities';
import { Plus, Check, Trash2, Trophy, Clock, CheckSquare, Sparkles, BookOpen, Brush, Heart } from 'lucide-react';

interface TaskBoardProps {
  role: 'parent' | 'child';
  childId: string;
}

export default function TaskBoard({ role, childId }: TaskBoardProps) {
  const tasks = useSignal(tasksSignal);
  const children = useSignal(childrenSignal);

  const activeChild = children.find(c => c.id === childId);
  const childTasks = tasks.filter(t => t.childId === childId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coins, setCoins] = useState(20);
  const [category, setCategory] = useState<'study' | 'hygiene' | 'chores' | 'health'>('study');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !childId) return;

    createTask(childId, title, description, coins, category);
    setTitle('');
    setDescription('');
    setCoins(20);
    setShowAddForm(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'study': return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'hygiene': return <Brush className="h-4 w-4 text-amber-500" />;
      case 'chores': return <CheckSquare className="h-4 w-4 text-emerald-500" />;
      case 'health': return <Heart className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-slate-500" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'study': return 'Estudos';
      case 'hygiene': return 'Higiene';
      case 'chores': return 'Tarefas';
      case 'health': return 'Saúde';
      default: return 'Geral';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs animate-in fade-in duration-300" id="task-board-panel">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-500" />
            Missões e Tarefas Gamificadas
          </h3>
          <p className="text-[11px] text-slate-500">Ganhos em moedas e experiência (XP)</p>
        </div>

        {role === 'parent' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition-all shadow-md shadow-indigo-600/10"
          >
            <Plus className="h-3.5 w-3.5" />
            Nova Missão
          </button>
        )}
      </div>

      {showAddForm && role === 'parent' && (
        <form onSubmit={handleAddTask} className="mb-5 p-4 border border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-xl space-y-3.5 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Título da Missão</label>
              <input
                type="text"
                required
                placeholder="Ex: Arrumar a mesa do café, Ler por 20min"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Descrição</label>
              <textarea
                placeholder="Ex: Guardar xícaras e passar pano na mesa."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 h-16 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Recompensa (💰 Moedas)</label>
              <input
                type="number"
                min={5}
                max={500}
                required
                value={coins}
                onChange={e => setCoins(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Categoria</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none"
              >
                <option value="study">Estudos 📚</option>
                <option value="hygiene">Higiene 🪥</option>
                <option value="chores">Tarefas do Lar 🏠</option>
                <option value="health">Saúde / Alimentação 🍎</option>
              </select>
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
              className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              Adicionar
            </button>
          </div>
        </form>
      )}

      {childTasks.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p className="text-2xl mb-1">🏆</p>
          <p className="text-xs">Nenhuma missão atribuída para este filho.</p>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {childTasks.map((task) => {
            const isPendingParentApproval = task.isCompleted && !task.isApproved;

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3 transition-all duration-300 hover:shadow-xs ${
                  task.isApproved
                    ? 'bg-slate-50/60 dark:bg-slate-900/40 opacity-75 line-through'
                    : isPendingParentApproval
                    ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30'
                    : 'bg-white dark:bg-slate-900/10'
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 mt-0.5">
                  {getCategoryIcon(task.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {task.title}
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {getCategoryLabel(task.category)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    {task.description}
                  </p>
                  
                  {/* Reward indicator */}
                  <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    <span>+{task.rewardCoins} Moedas</span>
                    <span className="text-slate-300">•</span>
                    <span>+{task.rewardCoins * 3} XP</span>
                  </div>
                </div>

                {/* Status and Action controls based on Role */}
                <div className="flex items-center gap-1.5">
                  {role === 'child' ? (
                    // Child view controls
                    task.isApproved ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg">
                        Concluído ✨
                      </span>
                    ) : task.isCompleted ? (
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg">
                        Aguardando Pai ⌛
                      </span>
                    ) : (
                      <button
                        onClick={() => completeTask(task.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors shadow-xs"
                      >
                        <Check className="h-4 w-4" />
                        Pronto!
                      </button>
                    )
                  ) : (
                    // Parent view controls
                    task.isApproved ? (
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Remover missão arquivada"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : isPendingParentApproval ? (
                      <button
                        onClick={() => approveTask(task.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors shadow-xs animate-bounce"
                      >
                        <Check className="h-4 w-4" />
                        Aprovar e Pagar
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                          Em andamento
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
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
