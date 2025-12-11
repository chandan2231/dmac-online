import { Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import GenericModal from '../../../../components/modal';
import MorenButton from '../../../../components/button';

// Assets
import Bird from '../../../../assets/ImageRecal/bird.webp';
import Boat from '../../../../assets/ImageRecal/boat.webp';
import Bus from '../../../../assets/ImageRecal/bus.webp';
import Car from '../../../../assets/ImageRecal/car.webp';
import Chair from '../../../../assets/ImageRecal/chair.webp';
import Cow from '../../../../assets/ImageRecal/cow.webp';
import Key from '../../../../assets/ImageRecal/key.webp';
import Tree from '../../../../assets/ImageRecal/tree.webp';

import AudioFile from '../../../../assets/ImageRecal/forAll.mp3';

// All images array
const ALL_IMAGES = [Bird, Boat, Bus, Car, Chair, Cow, Key, Tree];

interface IImageRecallGameProps {
    onComplete: () => void;
}

const ImageRecallGame = ({ onComplete }: IImageRecallGameProps) => {
    const [phase, setPhase] = useState<'instruction' | 'playing' | 'finished'>('instruction');
    const [currentImages, setCurrentImages] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Randomly select 5 images
    const selectRandomImages = () => {
        const shuffled = [...ALL_IMAGES].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 5);
    };

    const startGame = () => {
        setCurrentImages(selectRandomImages());
        setCurrentImageIndex(0);
        setPhase('playing');
    };

    const playAudio = () => {
        const audio = new Audio(AudioFile);
        audio.play().catch(error => console.error("Audio play failed:", error));
    };

    useEffect(() => {
        let timer: any;
        if (phase === 'playing') {
            if (currentImageIndex < currentImages.length) {
                // Play audio when showing a new image
                playAudio();

                timer = setTimeout(() => {
                    setCurrentImageIndex((prev) => prev + 1);
                }, 5000);

            } else {
                setPhase('finished');
            }
        }
        return () => clearTimeout(timer);
    }, [phase, currentImageIndex, currentImages]);

    // Handler for finishing the game cycle
    const handleNext = () => {
        onComplete();
    };

    const handleRepeat = () => {
        startGame();
    };

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

            {/* Instruction Modal */}
            <GenericModal
                isOpen={phase === 'instruction'}
                onClose={() => { }} // Prevent closing by clicking outside
                title="Instruction"
                hideCancelButton={true}
                submitButtonText="Next"
                onSubmit={startGame}
            >
                <Typography>
                    The picture will flash for 5 second one after another. Remember the pictures, you will be asked to recall them immediately after and later
                </Typography>
            </GenericModal>

            {/* Game Content */}
            {(phase === 'playing' || phase === 'finished') && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Box
                        component="img"
                        src={currentImages[phase === 'finished' ? currentImages.length - 1 : currentImageIndex]}
                        alt="Recall Item"
                        sx={{
                            maxWidth: '80%',
                            maxHeight: '60vh',
                            objectFit: 'contain'
                        }}
                    />

                    {/* Buttons show only when finished */}
                    {phase === 'finished' && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <MorenButton variant="outlined" onClick={handleRepeat}>Repeat</MorenButton>
                            <MorenButton variant="contained" onClick={handleNext}>Next</MorenButton>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default ImageRecallGame;
