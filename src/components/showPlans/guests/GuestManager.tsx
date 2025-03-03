
import React, { useState } from 'react';
import GuestSearchInput from './GuestSearchInput';
import GuestList from './GuestList';
import GuestForm from '../../guests/GuestForm';
import type { Guest } from '../../../types';

interface GuestManagerProps {
  selectedGuests: Guest[];
  onAddGuest: (guest: Guest) => void;
  onRemoveGuest: (guestId: string) => void;
}

const GuestManager: React.FC<GuestManagerProps> = ({
  selectedGuests,
  onAddGuest,
  onRemoveGuest,
}) => {
  const [showGuestForm, setShowGuestForm] = useState(false);

  const handleAddGuest = (guest: Guest) => {
    onAddGuest(guest);
    setShowGuestForm(false);
  };

  return (
    <div className="space-y-4">
      {!showGuestForm ? (
        <GuestSearchInput
          onSelect={onAddGuest}
          onAddNew={() => setShowGuestForm(true)}
        />
      ) : (
        <GuestForm
          onAdd={handleAddGuest}
          onCancel={() => setShowGuestForm(false)}
        />
      )}

      <GuestList
        guests={selectedGuests}
        onRemove={onRemoveGuest}
      />
    </div>
  );
};

export default GuestManager;
