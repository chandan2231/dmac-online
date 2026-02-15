import { useEffect, useRef } from 'react';

interface AudioPlayerProps {
    src: string;
    play: boolean;
    onEnded?: () => void;
}

const AudioPlayer = ({ src, play, onEnded }: AudioPlayerProps) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const onEndedRef = useRef(onEnded);

    // Keep onEnded ref in sync
    useEffect(() => {
        onEndedRef.current = onEnded;
    }, [onEnded]);

    useEffect(() => {
        audioRef.current = new Audio(src);

        const handleEnded = () => {
            if (onEndedRef.current) onEndedRef.current();
        };

        audioRef.current.addEventListener('ended', handleEnded);

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', handleEnded);
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [src]); // Only recreate audio if src changes

    useEffect(() => {
        let playTimer: NodeJS.Timeout;

        if (play && audioRef.current && src) {
            // Wait 1 second before playing audio
            playTimer = setTimeout(() => {
                const promise = audioRef.current?.play();
                if (promise !== undefined) {
                    promise.catch(e => console.error("Audio play failed", e));
                }
            }, 1000);
        } else if (!play && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        return () => {
            if (playTimer) clearTimeout(playTimer);
        };
    }, [play, src]); // Re-run if play OR src changes

    return null; // Logic only component
};

export default AudioPlayer;
