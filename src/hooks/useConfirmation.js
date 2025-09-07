import { useState } from 'react';

export const useConfirmation = () => {
  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {}
  });

  const showConfirmation = ({
    title,
    message,
    type = 'warning',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  }) => {
    return new Promise((resolve) => {
      setConfirmationState({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        onConfirm: () => {
          resolve(true);
          setConfirmationState(prev => ({ ...prev, isOpen: false }));
        }
      });
    });
  };

  const closeConfirmation = () => {
    setConfirmationState(prev => ({ ...prev, isOpen: false }));
  };

  return {
    confirmationState,
    showConfirmation,
    closeConfirmation
  };
};