import { useEffect, useRef, type RefObject } from "react";
import type { DailyCall, DailyEventObjectTrack } from "@daily-co/daily-js";

interface Props {
  callRef: RefObject<DailyCall | null>;
}

export default function VideoTile({ callRef }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const call = callRef.current;
    if (!call) return;

    function handleTrack(event: DailyEventObjectTrack) {
      if (event.participant?.local) return;
      if (event.track.kind === "video" && videoRef.current) {
        videoRef.current.srcObject = new MediaStream([event.track]);
      }
      if (event.track.kind === "audio" && audioRef.current) {
        audioRef.current.srcObject = new MediaStream([event.track]);
      }
    }

    call.on("track-started", handleTrack);
    return () => {
      call.off("track-started", handleTrack);
    };
  }, [callRef]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover rounded-2xl"
      />
      <audio ref={audioRef} autoPlay />
    </>
  );
}
