import { useEffect, useRef } from 'react';

interface AudioPlayerProps {
    src: string;
    play: boolean;
    onEnded?: () => void;
}

const AudioPlayer = ({ src, play, onEnded }: AudioPlayerProps) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(src);

        const handleEnded = () => {
            if (onEnded) onEnded();
        };

        audioRef.current.addEventListener('ended', handleEnded);

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', handleEnded);
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [src, onEnded]);

    useEffect(() => {
        let playTimer: NodeJS.Timeout;

        if (play && audioRef.current) {
            // Wait 1 second before playing audio
            playTimer = setTimeout(() => {
                audioRef.current?.play().catch(e => console.error("Audio play failed", e));
            }, 1000);
        } else if (!play && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        return () => {
            if (playTimer) clearTimeout(playTimer);
        };
    }, [play]);

    return null; // Logic only component
};

export default AudioPlayer;
