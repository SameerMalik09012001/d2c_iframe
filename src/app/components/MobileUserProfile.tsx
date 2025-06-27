'use client';

import { memo, useEffect, useState } from 'react';

interface UserProfileProps {
  animateRing: boolean;
  isAgentSpeaking: boolean;
  showPhone: boolean;
}
const MobileUserProfile = ({
  animateRing,
  isAgentSpeaking,
  showPhone,
}: UserProfileProps) => {
  const [time, setTime] = useState(0);
  const formatTime = (seconds: any) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (isAgentSpeaking) {
      timer = setInterval(() => setTime((prev) => prev + 1), 1000);
    }

    return () => {
      setTime(0);
      clearInterval(timer);
    };
  }, [isAgentSpeaking]);

  useEffect(() => {
    if (showPhone) {
      setTime(0);
    }
  }, [showPhone]);
  
  return (
    <>
      <div className='relative flex flex-col py-20 items-center'>
        {showPhone && (
          <>
            {' '}
            <div className='absolute w-40 h-40 rounded-full bg-blue-500 opacity-30 animate-ping'></div>
            <div
              className={`absolute w-44 h-44 rounded-full border-4 ${
                animateRing ? 'border-blue-400' : 'border-transparent'
              } transition-all duration-500`}
            ></div>
          </>
        )}
        <img
          // src={`https://randomuser.me/api/portraits/women/${Math.floor(Math.random() * 100) + 1}.jpg`}
          src='https://exei-bkt-important-object.s3.ap-south-1.amazonaws.com/VOice-demo.png'
          alt='Caller'
          className='w-32 h-32 rounded-full border-4 border-white shadow-xl'
        />
        {showPhone && (
          <p className='mt-4 text-white text-xl font-semibold'>
            {!isAgentSpeaking ? 'Ringing' : formatTime(time)}
          </p>
        )}
      </div>
    </>
  );
};

export default memo(MobileUserProfile);
