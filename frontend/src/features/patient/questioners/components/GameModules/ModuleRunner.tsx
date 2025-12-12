import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import GameApi, { type Module, type SessionData } from '../../../../../services/gameApi';
import CustomLoader from '../../../../../components/loader';
import ImageFlash from './ImageFlash';
import VisualSpatial from './VisualSpatial';

interface ModuleRunnerProps {
    userId: number; // Actually userId might come from auth context inside here or passed down
    languageCode: string;
    onAllModulesComplete: () => void;
}

const ModuleRunner = ({ userId, languageCode, onAllModulesComplete }: ModuleRunnerProps) => {
    const [modules, setModules] = useState<Module[]>([]);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [session, setSession] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const res = await GameApi.getModules();
                const sorted = (res.modules || []).sort((a, b) => a.order_index - b.order_index);
                setModules(sorted);
                if (sorted.length > 0) {
                    startModuleSession(sorted[0].id);
                } else {
                    console.warn("No active game modules found.");
                    setError("No active game modules found.");
                    onAllModulesComplete();
                }
            } catch (error) {
                console.error("Failed to fetch modules", error);
                setError("Failed to fetch game modules.");
            }
        };
        fetchModules();
    }, []);

    const startModuleSession = async (moduleId: number) => {
        setLoading(true);
        setError(null);
        try {
            console.log(`[ModuleRunner] Starting session for module ${moduleId}`);
            const sess = await GameApi.startSession(moduleId, userId, languageCode);
            console.log(`[ModuleRunner] Session started:`, sess);
            setSession(sess);
        } catch (error) {
            console.error("Failed to start session", error);
            setError("Failed to start game session. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleModuleSubmit = async (payload: any) => {
        if (!session) return;
        setLoading(true);
        try {
            const res = await GameApi.submitSession(session.module.id, session.session_id, payload);

            if (res.next_module_id) {
                await startModuleSession(res.next_module_id);
                const nextIdx = modules.findIndex(m => m.id === res.next_module_id);
                if (nextIdx !== -1) setCurrentModuleIndex(nextIdx);
            } else {
                onAllModulesComplete();
            }
        } catch (error) {
            console.error("Submit failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageFlashComplete = (answerText: string) => {
        if (!session?.question) return;
        const payload = {
            question_id: session.question.question_id,
            language_code: languageCode,
            answer_text: answerText
        };
        console.log('Submitting ImageFlash payload to API:', payload);
        handleModuleSubmit(payload);
    };

    const handleVisualSpatialComplete = (answers: { question_id: number, selected_option_key: string }[]) => {
        handleModuleSubmit({
            answers
        });
    };



    if (error) {
        return (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="error" variant="h6">{error}</Typography>
            </Box>
        );
    }

    if (loading || !session) {
        return <CustomLoader />;
    }

    const moduleCode = session.module.code;

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            {moduleCode === 'IMAGE_FLASH' && (
                <ImageFlash session={session} onComplete={handleImageFlashComplete} languageCode={languageCode} />
            )}
            {moduleCode === 'VISUAL_SPATIAL' && (
                <VisualSpatial session={session} onComplete={handleVisualSpatialComplete} />
            )}
        </Box>
    );
};

export default ModuleRunner;
