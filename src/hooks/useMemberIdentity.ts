import { useState, useEffect } from 'react';
import { LOCAL_STORAGE_KEYS } from '../config/constants';

export function useMemberIdentity() {
  const [memberName, setMemberName] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.MEMBER_NAME) || '';
  });
  
  const [isPromptOpen, setIsPromptOpen] = useState<boolean>(false);

  useEffect(() => {
    if (memberName) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.MEMBER_NAME, memberName);
    }
  }, [memberName]);

  const updateName = (newName: string) => {
    const trimmed = newName.trim();
    if (trimmed) {
      setMemberName(trimmed);
      localStorage.setItem(LOCAL_STORAGE_KEYS.MEMBER_NAME, trimmed);
      setIsPromptOpen(false);
    }
  };

  const promptForName = (): Promise<string> => {
    return new Promise((resolve) => {
      if (memberName) {
        resolve(memberName);
      } else {
        setIsPromptOpen(true);
        // Temporary handler
        const checkInterval = setInterval(() => {
          const current = localStorage.getItem(LOCAL_STORAGE_KEYS.MEMBER_NAME);
          if (current) {
            clearInterval(checkInterval);
            resolve(current);
          }
        }, 300);
      }
    });
  };

  return {
    memberName,
    updateName,
    isPromptOpen,
    setIsPromptOpen,
    promptForName,
    hasName: Boolean(memberName),
  };
}
