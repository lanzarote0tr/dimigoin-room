// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { getMe } from '../api/me';
import { getProfile } from '../api/profile';
import { login as loginAPI, signup as signupAPI, logout as logoutAPI, refreshToken as refreshAPI } from '../api/auth';
import Spinner from '../components/Spinner';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null); // 사용자 프로필 정보 추가
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // 사용자 정보와 프로필 정보를 함께 로드
    const loadUserData = async () => {
        try {
            const userData = await getMe();
            setUser(userData);

            // 사용자 정보에 프로필 ID가 있다면 프로필 정보도 로드
            if (userData.profile_id) {
                try {
                    const profileData = await getProfile(userData.profile_id);
                    setUserProfile(profileData);
                } catch (profileError) {
                    console.log('프로필 정보를 불러올 수 없습니다:', profileError);
                    setUserProfile(null);
                }
            }
        } catch (error) {
            console.log('세션이 유효하지 않습니다.');
            setUser(null);
            setUserProfile(null);
        }
    };

    // 앱 초기화 시 세션 확인
    useEffect(() => {
        const checkSession = async () => {
            await loadUserData();
            setIsLoading(false);
        };
        checkSession();
    }, []);

    // 회원가입
    const register = async (userData) => {
        try {
            await signupAPI(userData);
            alert('회원가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.');
            navigate('/login');
        } catch (error) {
            alert(error || "회원가입 중 오류가 발생했습니다.");
        }
    };

    // 로그인
    const login = async (email, password) => {
        try {
            await loginAPI({ email, password });

            // 로그인 성공 후 사용자 정보 로드
            await loadUserData();

            navigate('/');
        } catch (error) {
            alert(error || "로그인에 실패했습니다.");
        }
    };

    // 토큰 리프레시
    const refreshToken = async () => {
        try {
            await refreshAPI();

            // 토큰 갱신 후 사용자 정보 갱신
            await loadUserData();
        } catch (error) {
            alert(error || "토큰 갱신에 실패했습니다. 다시 로그인해주세요.");
            setUser(null);
            setUserProfile(null);
            navigate('/login');
        }
    };

    // 로그아웃
    const logout = async () => {
        try {
            await logoutAPI();
        } catch (error) {
            console.error("로그아웃 실패:", error);
        } finally {
            setUser(null);
            setUserProfile(null);
            navigate('/login');
        }
    };

    // 사용자 정보 새로고침 (프로필 업데이트 후 호출용)
    const refreshUserData = async () => {
        await loadUserData();
    };

    const value = {
        user,
        userProfile,
        login,
        logout,
        register,
        refreshToken,
        refreshUserData,
        isLoading
    };

    if (isLoading) {
        return <Spinner />;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Context를 쉽게 사용하기 위한 커스텀 Hook
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}