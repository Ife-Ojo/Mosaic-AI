'use client';

import { StudyMaterial, NotionWorkspaceInfo, SupportedLanguageCode } from '@/types';
import { SAMPLE_MATERIALS, INITIAL_NOTION_WORKSPACE } from './sample-data';

const STORAGE_KEYS = {
  MATERIALS: 'mosaic_study_materials_v1',
  NOTION_WORKSPACE: 'mosaic_notion_workspace_v1',
  TARGET_LANG: 'mosaic_preferred_target_lang_v1',
  STUDY_STREAK: 'mosaic_study_streak_v1',
};

export function getStoredMaterials(): StudyMaterial[] {
  if (typeof window === 'undefined') return SAMPLE_MATERIALS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(SAMPLE_MATERIALS));
      return SAMPLE_MATERIALS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read materials from localStorage:', e);
    return SAMPLE_MATERIALS;
  }
}

export function saveMaterials(materials: StudyMaterial[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  } catch (e) {
    console.error('Failed to write materials to localStorage:', e);
  }
}

export function addOrUpdateMaterial(material: StudyMaterial): StudyMaterial[] {
  const current = getStoredMaterials();
  const index = current.findIndex(m => m.id === material.id);
  let updated: StudyMaterial[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...material, lastModified: new Date().toISOString() };
  } else {
    updated = [material, ...current];
  }
  saveMaterials(updated);
  return updated;
}

export function deleteMaterial(id: string): StudyMaterial[] {
  const current = getStoredMaterials();
  const updated = current.filter(m => m.id !== id);
  saveMaterials(updated);
  return updated;
}

export function getStoredNotionWorkspace(): NotionWorkspaceInfo {
  if (typeof window === 'undefined') return INITIAL_NOTION_WORKSPACE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTION_WORKSPACE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTION_WORKSPACE, JSON.stringify(INITIAL_NOTION_WORKSPACE));
      return INITIAL_NOTION_WORKSPACE;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTION_WORKSPACE;
  }
}

export function saveNotionWorkspace(info: NotionWorkspaceInfo): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.NOTION_WORKSPACE, JSON.stringify(info));
  } catch (e) {
    console.error('Failed to save Notion workspace to localStorage:', e);
  }
}

export function getPreferredTargetLanguage(): SupportedLanguageCode {
  if (typeof window === 'undefined') return 'es';
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TARGET_LANG);
    return (stored as SupportedLanguageCode) || 'es';
  } catch {
    return 'es';
  }
}

export function savePreferredTargetLanguage(lang: SupportedLanguageCode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TARGET_LANG, lang);
  } catch {}
}

export function simulateNotionSync(materialId: string): { success: boolean; notionUrl: string; syncedAt: string } {
  const materials = getStoredMaterials();
  const mat = materials.find(m => m.id === materialId);
  const fakePageId = 'notion-' + Math.random().toString(36).substring(2, 9);
  const fakeUrl = `https://notion.so/aidens-vault/${encodeURIComponent(mat?.title || 'Study-Material')}-${fakePageId}`;
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (mat) {
    mat.notionSyncStatus = 'synced';
    mat.notionPageId = fakePageId;
    mat.notionUrl = fakeUrl;
    saveMaterials(materials);
  }

  const workspace = getStoredNotionWorkspace();
  workspace.lastSyncTimestamp = `Today at ${now}`;
  workspace.syncedItemsCount += 1;
  saveNotionWorkspace(workspace);

  return { success: true, notionUrl: fakeUrl, syncedAt: workspace.lastSyncTimestamp };
}
