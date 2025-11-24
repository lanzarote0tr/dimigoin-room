// src/context/ProjectContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getProjects, createProject, getProject, applyToProject } from '../api/projects';
import { useAuth } from './AuthContext';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // 프로젝트 목록 조회
    const fetchProjects = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const projectsData = await getProjects();
            setProjects(projectsData);
        } catch (error) {
            console.error('프로젝트 목록 조회 실패:', error);
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    // 컴포넌트 마운트 시 프로젝트 목록 로드
    useEffect(() => {
        fetchProjects();
    }, []);

    // 새 프로젝트 추가
    const addProject = async (projectData) => {
        try {
            // 백엔드 스펙에 맞게 데이터 변환
            const payload = {
                profile_id: user?.profileId, // 사용자의 프로필 ID 필요
                title: projectData.title,
                description: projectData.description,
                deadline: projectData.deadline || new Date().toISOString(),
                admits: projectData.admits || 1,
                skills: projectData.skillIds || [] // 스킬 ID 배열
            };

            const newProject = await createProject(payload);

            // 상태 업데이트
            setProjects(prevProjects => [newProject, ...prevProjects]);

            return newProject;
        } catch (error) {
            console.error('프로젝트 등록 실패:', error);
            throw error;
        }
    };

    // 프로젝트 상세 정보 조회
    const getProjectById = async (projectId) => {
        try {
            return await getProject(projectId);
        } catch (error) {
            console.error('프로젝트 상세 조회 실패:', error);
            throw error;
        }
    };

    // 프로젝트 지원
    const applyToProjectById = async (projectId) => {
        try {
            if (!user?.profileId) {
                throw new Error('프로필 정보가 필요합니다.');
            }

            const result = await applyToProject(projectId, user.profileId);

            // 프로젝트 목록 새로고침 (지원자 수 업데이트 등)
            await fetchProjects();

            return result;
        } catch (error) {
            console.error('프로젝트 지원 실패:', error);
            throw error;
        }
    };

    const value = {
        projects,
        isLoading,
        error,
        addProject,
        getProjectById,
        applyToProject: applyToProjectById,
        refreshProjects: fetchProjects
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
}