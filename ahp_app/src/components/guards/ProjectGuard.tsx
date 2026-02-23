import React from 'react';
import Card from '../common/Card';

interface ProjectGuardProps {
  selectedProjectId: string | null;
  /** Title shown in the "select project" card */
  title: string;
  /** Tab to navigate to when clicking the fallback button */
  fallbackTab: string;
  /** Label for the fallback navigation button */
  fallbackLabel?: string;
  onNavigate: (tab: string) => void;
  children: React.ReactNode;
}

/**
 * Guard component that requires a project to be selected.
 * Shows a standard "select project first" UI when no project is selected.
 *
 * Eliminates the 5+ duplicated "프로젝트를 먼저 선택해주세요" blocks in App.tsx.
 */
export default function ProjectGuard({
  selectedProjectId,
  title,
  fallbackTab,
  fallbackLabel = '프로젝트 목록으로 이동',
  onNavigate,
  children,
}: ProjectGuardProps) {
  if (!selectedProjectId) {
    return (
      <Card title={title}>
        <div className="text-center py-8">
          <p className="text-gray-500">프로젝트를 먼저 선택해주세요.</p>
          <button
            onClick={() => onNavigate(fallbackTab)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {fallbackLabel}
          </button>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}
