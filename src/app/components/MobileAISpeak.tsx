'use client';

import { Clock, PhoneIncoming } from 'lucide-react';

const MobileAiSpeaking = ({
  rejectCall,
  showPhone,
  setShowPhone,
  setDisableCloseButton,
  disableCloseButton,
}: any) => {
  return (
    <>
      <div>
        <div className='absolute bottom-16 w-full flex flex-col items-center space-y-8'>
          <div className='flex space-x-20 cursor-pointer'>
            <button
              onClick={() =>
                showPhone
                  ? disableCloseButton
                    ? undefined
                    : rejectCall()
                  : setShowPhone(true)
              }
              className={`${
                showPhone ? 'bg-red-600' : 'bg-green-600'
              } p-5 rounded-full shadow-lg  ${
                disableCloseButton
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer'
              }`}
            >
              <PhoneIncoming
                size={28}
                className='text-white'
              />
            </button>
          </div>
          <p className='text-white'>End Call</p>
        </div>
      </div>
    </>
  );
};

export default MobileAiSpeaking;
