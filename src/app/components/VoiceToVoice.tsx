'use client';

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import MobileViewForVoice from './MobileView';

interface VoiceComponentProps {
  persona: string;
  domain_name: string;
  closeModal: () => void;
  sessionId: string;
  clientId: string;
  showPhone: boolean;
  setShowPhone: Dispatch<SetStateAction<boolean>>;
}

const VoiceToVoice: React.FC<VoiceComponentProps> = ({
  closeModal,
  persona,
  domain_name,
  sessionId,
  clientId,
  showPhone,
  setShowPhone,
}) => {
  if (!showPhone) {
    return (
      <>
        <MobileViewForVoice
          closeModal={closeModal}
          stopRecording={()=> {}}
          transcript={''}
          scrollDuraion={undefined}
          showJustText={false}
          showClose={false}
          showPhone={showPhone}
          setShowPhone={setShowPhone}
        />
      </>
    );
  }  

  const audioRef = useRef<HTMLAudioElement>(null);
  const socketRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | AudioWorkletNode | null>(
    null
  );
  const audioContextRef = useRef<AudioContext | null>(null);
  const [transcript, setTranscript] = useState(
    'Hii, Thanks for calling. I am Lisa. How can i assist you today?'
  );
  const hasInitializedRef = useRef(false);
  const [scrollDuraion, setScrollDuration] = useState<number>();
  const [showJustText, setShowJustText] = useState(true);
  const audioQueueRef = useRef<
    { data: string; chunk: string; id: string; end: boolean }[] | null
  >([]);
  const isPlayingRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const currentQuestionId = useRef<string>('');
  const ignoredIds = useRef<string[]>([]);
  const [isListening, setIsListening] = useState(true);
  const [isMicOpen, setIsMicOpen] = useState(true);
  const isMicOpenRef = useRef<boolean>(true);
  const [silenceTime, setSilenceTime] = useState<number>();
  const [showClose, setShowClose] = useState<boolean>(false);
  const [disableCloseButton, setDisableCloseButton] = useState(false)


  const VOICE = {
    languageCode: 'en-US',
    name: 'en-US-Standard-F',
    ssmlGender: 'FEMALE',
  };

  const REQUEST_CONFIG: any = {
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
    },
    interimResults: true,
    singleUtterance: false,
  };

  useEffect(() => {
    if (isMicOpen) {
      isMicOpenRef.current = true;
    } else {
      isMicOpenRef.current = false;
    }
  }, [isMicOpen]);

  useEffect(() => {
    const increaseTime = setInterval(() => {
      setSilenceTime((prev) => {
        if (prev === undefined) return 1;
        if (prev >= 60) {
          stopRecording();
          closeModal();
        }
        return prev + 5;
      });
    }, 5000);

    setTimeout(() => {
      if (audioCtxRef?.current === null) {
        audioCtxRef.current = new AudioContext();
      }
    }, 1000);

    return () => {
      clearInterval(increaseTime);
    };
  }, []);

  const playNextAudioChunk = async () => {
    if (
      isPlayingRef.current ||
      (audioQueueRef.current && audioQueueRef.current.length === 0) ||
      !audioCtxRef.current
    ) {
      return;
    }

    if (audioQueueRef.current) {
      const nextBase64:
        | { data: string; chunk: string; id: string; end: boolean }
        | undefined = audioQueueRef.current.shift();
      if (!nextBase64) return;

      if (nextBase64.end) {
        setIsListening(true);
        return;
      } else {
        setIsListening(false);
      }

      const audioCtx = audioCtxRef.current;
      setTranscript(nextBase64?.chunk);
      const binaryStr = atob(nextBase64?.data);
      currentQuestionId.current = nextBase64?.id;
      const len = binaryStr.length;
      const buffer = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        buffer[i] = binaryStr.charCodeAt(i);
      }

      try {
        isPlayingRef.current = true;
        const audioBuffer = await audioCtx.decodeAudioData(buffer.buffer);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);

        sourcesRef.current.push(source);
        source.start(0);

        source.onended = () => {
          isPlayingRef.current = false;
          playNextAudioChunk();
        };
      } catch (err) {
        console.error('Error decoding/playing WAV audio:', err);
        isPlayingRef.current = false;
        playNextAudioChunk();
      }
    }
  };

  const createSocketAndEvent = () => {
    socketRef.current = io(process?.env.NEXT_BACKEND_SOCKET_ENDPOINT);

    socketRef.current.on(
      'audio-data',
      (body: { data: string; chunk: string; id: string; end: boolean }) => {
        if (
          audioRef.current &&
          audioQueueRef.current &&
          audioQueueRef.current &&
          !ignoredIds.current?.includes(body.id)
        ) {
          audioQueueRef.current.push(body);
          playNextAudioChunk();
        }
      }
    );

    socketRef.current?.on(
      'transcript',
      (body: { data: string; type: string; interrupt?: boolean }) => {
        if (body.data) {
          setSilenceTime(0);
          if (body.type === 'user') {
            setScrollDuration(3);
            setShowJustText(false);

            if (body?.interrupt) {
              sourcesRef.current.forEach((src) => {
                try {
                  src.stop();
                } catch (e) {
                  console.warn('Error stopping audio source:', e);
                }
              });
              sourcesRef.current = [];
              audioQueueRef.current = [];
              const id =
                typeof currentQuestionId === 'string' &&
                currentQuestionId !== ''
                  ? currentQuestionId
                  : currentQuestionId.current;
              if (id !== '' && !ignoredIds.current.includes(id)) {
                ignoredIds.current = [...ignoredIds.current, id];
              }
            } else {
              setTranscript(body.data);
            }
          } else {
            setScrollDuration(undefined);
            setShowJustText(true);
          }
        }
      }
    );
  };

  useEffect(() => {
    const callGreetAudio = async () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      
      setDisableCloseButton(true)
      if (audioCtxRef.current) {
        try {
          const pay = {
            text: `Hii, Thanks for calling. I am Lisa. How can i assist you today?`,
            VOICE: VOICE,
          };
          socketRef.current.emit('getGreetAudio', pay);
          socketRef.current.on('greet-audio', async (audioData: string) => {
            if (audioData) {
              setIsListening(false);
              const nextBase64 = audioData;
              if (!nextBase64) return;
              const audioCtx = audioCtxRef.current!;
              const binaryStr = atob(nextBase64);
              const len = binaryStr.length;
              const buffer = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                buffer[i] = binaryStr.charCodeAt(i);
              }
              const audioBuffer = await audioCtx.decodeAudioData(buffer.buffer);
              const source = audioCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioCtx.destination);
              source.start(0);
              sourcesRef.current.push(source);
              source.onended = () => {
                startRecording();
                setSilenceTime(0);
                setTimeout(() => {
                  setShowClose(true);
                  setDisableCloseButton(false)
                }, 500);

                setIsListening(true);
              };
            }
          });
        } catch (error) {
          setDisableCloseButton(false)
          console.error('Error fetching greet audio:', error);
        }
      }
    };

    createSocketAndEvent();
    callGreetAudio();

    const restartSession = setInterval(() => {
      if (isMicOpenRef.current) {
        micOff();
        setTimeout(() => {
          startRecording();
        }, 100);
      }
    }, 4 * 60 * 1000);

    return () => {
      clearInterval(restartSession);
      socketRef.current.emit('destroyStream');

      // ⛔ Stop and clear audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      }

      // 🎤 Stop mic input if active
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());

      // 🎧 Close AudioContext if needed
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== 'closed'
      ) {
        audioContextRef.current.close();
      }

      socketRef.current?.disconnect();

      // Stop all playing audio sources
      sourcesRef.current.forEach((src) => {
        try {
          src.stop();
        } catch (e) {
          console.warn('Error stopping audio source:', e);
        }
      });
      sourcesRef.current = [];
    };
  }, []);

  function convertFloat32ToInt16(buffer: Float32Array) {
    const l = buffer.length;
    const int16Buffer = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16Buffer[i] = Math.max(-1, Math.min(1, buffer[i])) * 0x7fff;
    }
    return int16Buffer.buffer;
  }

  const startRecording = async () => {
    try {
      if (!socketRef.current) {
        createSocketAndEvent();
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const audioContext = new AudioContext({ sampleRate: 16000 });

      const source = audioContext.createMediaStreamSource(mediaStream);

      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        const int16Buffer = convertFloat32ToInt16(input);

        socketRef.current?.emit('stt', {
          int16Buffer,
          sessionId,
          CLIENTID: clientId,
          persona,
          domain_name,
          REQUEST_CONFIG,
          VOICE,
        });
      };

      mediaStreamRef.current = mediaStream;
      audioContextRef.current = audioContext;
      processorRef.current = processor;
    } catch (error) {
      console.error(
        '🎙️ Failed to start recording with ScriptProcessor:',
        error
      );
    }
  };

  const stopRecording = async () => {
    try {
      setIsListening(false);
      // ⛔ Stop and clear audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      }

      // 🎤 Stop mic input if active
      if (mediaStreamRef?.current) {
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      }

      // 🎧 Close AudioContext if needed
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== 'closed'
      ) {
        audioContextRef.current.close();
      }


      // Stop all playing audio sources
      sourcesRef.current.forEach((src) => {
        try {
          src.stop();
        } catch (e) {
          console.warn('Error stopping audio source:', e);
        }
      });
      sourcesRef.current = [];

      if (audioQueueRef.current) {
        audioQueueRef.current = null;
      }

      socketRef.current?.emit('end-stt');
      socketRef.current?.emit('destroyStream');
      socketRef.current?.disconnect();

      console.log('🛑 Recording stopped cleanly');
    } catch (e) {
      console.error('❌ Failed to stop recording:', e);
    }
  };

  const micOff = async () => {
    try {
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== 'closed'
      ) {
        await audioContextRef.current.close();
      }
      audioContextRef.current = null;

      if (processorRef.current) {
        processorRef.current?.disconnect();
        processorRef.current = null;
      }

      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;

      socketRef.current.emit('destroyStream');
      socketRef.current?.emit('end-stt');
      socketRef.current.disconnect();

      console.log('🛑 Recording stopped cleanly');
    } catch (e) {
      console.error('❌ Failed to stop recording:', e);
    }
  };

  return (
    <>
      <MobileViewForVoice
        closeModal={closeModal}
        stopRecording={stopRecording}
        transcript={transcript}
        scrollDuraion={scrollDuraion}
        showJustText={showJustText}
        showClose={showClose}
        showPhone={showPhone}
        setShowPhone={setShowPhone}
        setDisableCloseButton={setDisableCloseButton}
        disableCloseButton={disableCloseButton}
      />

      <audio
        style={{ display: 'none' }}
        ref={audioRef}
        controls
      />
    </>
  );
};

export default VoiceToVoice;
