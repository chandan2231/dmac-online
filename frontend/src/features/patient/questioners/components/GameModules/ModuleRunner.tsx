import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
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

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const res = await GameApi.getModules();
                const sorted = (res.modules || []).sort((a, b) => a.order_index - b.order_index);
                setModules(sorted);
                if (sorted.length > 0) {
                    startModuleSession(sorted[0].id);
                } else {
                    onAllModulesComplete();
                }
            } catch (error) {
                console.error("Failed to fetch modules", error);
            }
        };
        fetchModules();
    }, []);

    const startModuleSession = async (moduleId: number) => {
        setLoading(true);
        try {
            const sess = await GameApi.startSession(moduleId, userId, languageCode);
            setSession(sess);
        } catch (error) {
            console.error("Failed to start session", error);
            // If session start fails, maybe we should stop?
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
        handleModuleSubmit({
            question_id: session.question.question_id,
            language_code: languageCode,
            answer_text: answerText
        });
    };

    const handleVisualSpatialComplete = (answers: { question_id: number, selected_option_key: string }[]) => {
        handleModuleSubmit({
            answers
        });
    };



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
