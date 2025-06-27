'use client'


import { useEffect, useRef, useState } from "react";
import { DeviceFrameset } from "react-device-frameset";
import "react-device-frameset/styles/marvel-devices.min.css";
import FormattedText from "./WrapInDiv";
import MobileUserProfile from "./MobileUserProfile";
import MobileAiSpeaking from "./MobileAISpeak";
const MobileViewForVoice = ({
  isAgentSpeaking = true,
  stopRecording,
  closeModal,
  transcript,
  scrollDuraion,
  showJustText,
  showPhone,
  setShowPhone,
  setDisableCloseButton,
  disableCloseButton
}: any) => {
  const [time, setTime] = useState(0);
  const [animateRing, setAnimateRing] = useState(false);
  const [deviceHeight, setDeviceHeight] = useState(600);

useEffect(() => {
  if (typeof window !== 'undefined') {
    const height = window.innerHeight >= 800 ? 800 : 600;
    setDeviceHeight(height);
  }
}, []);


  const rejectCall = async () => {
    stopRecording();
    setTimeout(() => {
      closeModal();
    }, 500);
  };

  const getCurrentTime = () => {
    let now = new Date();
    let hour = now.getHours();
    let minute = now.getMinutes();

    const time = `${hour}:${minute}`;

    return time;
  };

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (transcript && scrollDuraion && !showJustText) {
      setTimeout(() => {
        const scrollEl = scrollRef.current;
        if (!scrollEl) return;

        const distance = scrollEl.scrollHeight - scrollEl.clientHeight;
        const duration = scrollDuraion * 1000;
        const start = scrollEl.scrollTop;
        const startTime = performance.now();

        const animateScroll = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          scrollEl.scrollTop = start + distance * progress;

          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          }
        };

        requestAnimationFrame(animateScroll);
      }, 2000);
    }
  }, [transcript, scrollDuraion, showJustText]);

  return (
    <DeviceFrameset device="iPhone X" color="black" width={375} height={deviceHeight}>
      <div
        className="relative w-full h-full bg-black rounded-[40px] shadow-xl border border-gray-300 overflow-hidden flex flex-col"
        style={{ backgroundImage: "url('/PhoneCall.png')" }}
      >
        <div className="absolute w-[90%] text-white ml-[5%]  px-3 py-2 h-[25%] rounded-xl  text-wrap top-[50%] font-MyPoppins">
          {scrollDuraion && !showJustText && (
            <div
              ref={scrollRef}
              className="text-center h-[50px] overflow-hidden"
            >
              <FormattedText
                inputText={String(transcript).replaceAll(`"`, "")}
                voice={true}
              />
            </div>
          )}
          {showJustText && (
            <div className="text-center h-[50px] overflow-hidden">
              <FormattedText
                inputText={String(transcript).replaceAll(`"`, "")}
                voice={true}
              />
            </div>
          )}
        </div>
        <div className="h-10 bg-black text-white flex justify-between items-center px-4 text-sm">
          <span>{getCurrentTime()}</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
        <MobileUserProfile
          animateRing={animateRing}
          isAgentSpeaking={isAgentSpeaking}
          showPhone={showPhone}
        />
        <MobileAiSpeaking rejectCall={rejectCall} disableCloseButton={disableCloseButton} showPhone={showPhone} setShowPhone={setShowPhone} setDisableCloseButton={setDisableCloseButton}/>
      </div>
    </DeviceFrameset>
  );
};

export default MobileViewForVoice;
