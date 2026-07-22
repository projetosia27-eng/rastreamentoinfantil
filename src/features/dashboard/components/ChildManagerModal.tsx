import React, { useState, useEffect } from 'react';
import { Child, DeviceType } from '../../../domain/entities';
import { supabaseDatabaseService } from '../../../services/supabaseDatabaseService';
import { createChild, updateChild } from '../../../data/app-state-store';
import { Smartphone, Watch, Radio, Tag } from 'lucide-react';

interface ChildManagerModalProps {
  onClose: () => void;
  childToEdit?: Child | null;
}

export default function ChildManagerModal({ onClose, childToEdit }: ChildManagerModalProps) {
  const [name, setName] = useState(childToEdit?.name || '');
  const [avatar, setAvatar] = useState(childToEdit?.avatar || '👦');
  const [birthDate, setBirthDate] = useState(childToEdit?.birthDate || '');
  const [characteristics, setCharacteristics] = useState(childToEdit?.characteristics || '');
  const [emergencyContact, setEmergencyContact] = useState(childToEdit?.emergencyContact || '');
  const [deviceType, setDeviceType] = useState<DeviceType>(childToEdit?.deviceType || 'smartwatch');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (childToEdit) {
      setName(childToEdit.name);
      setAvatar(childToEdit.avatar);
      setBirthDate(childToEdit.birthDate || '');
      setCharacteristics(childToEdit.characteristics || '');
      setEmergencyContact(childToEdit.emergencyContact || '');
      setDeviceType(childToEdit.deviceType || 'smartwatch');
    }
  }, [childToEdit]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey) {
      alert("Chave de API do ImgBB não configurada. Verifique o arquivo .env.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setAvatar(data.data.url);
      } else {
        throw new Error(data.error?.message || 'Erro ao fazer upload da imagem');
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Erro ao enviar a imagem. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsLoading(true);
    
    try {
      if (childToEdit) {
        const updatedChild: Child = {
          ...childToEdit,
          name,
          avatar,
          birthDate,
          characteristics,
          emergencyContact,
          deviceType,
        };
        
        // Save to Supabase
        await supabaseDatabaseService.upsertChild(updatedChild);
        
        // Update local state
        updateChild(updatedChild);
      } else {
        const tempId = `child-${Date.now()}`;
        const newChild: Child = {
          id: tempId,
          name,
          avatar,
          latitude: -23.55052,
          longitude: -46.633308,
          lastSeen: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          batteryLevel: 100,
          currentSafeZoneId: null,
          coins: 0,
          xp: 0,
          protectionMode: 'standard',
          birthDate,
          characteristics,
          emergencyContact,
          deviceType,
        };
        
        // Save to Supabase
        await supabaseDatabaseService.upsertChild(newChild);
        
        // Update local state - instead of just creating a basic one, we will use an update store method to set the full child
        createChild(name, avatar, newChild); 
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving child:", error);
      alert("Erro ao salvar criança. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
          {childToEdit ? 'Editar Perfil' : 'Adicionar Nova Criança'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Foto / Avatar</label>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl overflow-hidden border-2 border-indigo-500 shrink-0">
                {avatar.startsWith('http') || avatar.startsWith('data:') ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  avatar
                )}
              </div>
              
              <div className="flex-1">
                <label className="flex items-center justify-center w-full px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-xs font-semibold">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Fazer Upload de Foto (ImgBB)
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isLoading} />
                </label>
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Ou escolha um avatar:</div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {['👦', '👧', '👶', '🧑', '🦁', '🦉', '🦊', '🚀', '🐼', '🦄'].map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setAvatar(icon)}
                  className={`text-xl p-2 flex justify-center items-center rounded-xl border transition-all ${
                    avatar === icon
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Nome Completo</label>
            <input
              type="text"
              required
              placeholder="Ex: Lucas Silva"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Data de Nascimento</label>
            <input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Características Físicas e Sinais</label>
            <textarea
              placeholder="Ex: Cabelo castanho, olhos verdes, alergia a amendoim..."
              value={characteristics}
              onChange={e => setCharacteristics(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Contato de Emergência</label>
            <input
              type="tel"
              placeholder="Ex: (11) 98765-4321 - Mãe"
              value={emergencyContact}
              onChange={e => setEmergencyContact(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Dispositivo Rastreador Usado</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'smartwatch', label: 'Relógio 4G / GPS', icon: Watch, desc: 'Ideal para crianças pequenas' },
                { id: 'smartphone', label: 'Smartphone / Celular', icon: Smartphone, desc: 'Para crianças maiores' },
                { id: 'tag_bluetooth', label: 'Tag / Pulseira', icon: Tag, desc: 'Bluetooth em locais curtos' },
                { id: 'pendant', label: 'Pingente / Mochila', icon: Radio, desc: 'Rastreio discreto sem tela' },
              ].map((dev) => {
                const Icon = dev.icon;
                const isSelected = deviceType === dev.id;
                return (
                  <button
                    key={dev.id}
                    type="button"
                    onClick={() => setDeviceType(dev.id as DeviceType)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                      <Icon className="h-4 w-4 shrink-0 text-indigo-500" />
                      <span>{dev.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">{dev.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              {childToEdit ? 'Atualizar Perfil' : 'Salvar Criança'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
