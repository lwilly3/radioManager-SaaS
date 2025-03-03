import React from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import NewRundownForm from './NewRundownForm';

interface NewRundownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewRundownModal: React.FC<NewRundownModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Nouveau conducteur
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <NewRundownForm onClose={onClose} />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default NewRundownModal;