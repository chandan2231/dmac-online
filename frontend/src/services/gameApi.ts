import HttpService from './HttpService';

export type Module = {
    id: number;
    code: 'VISUAL_SPATIAL' | 'AUDIO_STORY' | 'AUDIO_STORY_2' | 'AUDIO_WORDS' | 'IMAGE_FLASH' | 'CONNECT_DOTS' | 'EXECUTIVE' | 'SEMANTIC' | 'NUMBER_RECALL' | 'DRAWING_RECALL' | 'REVERSE_NUMBER_RECALL' | 'COLOR_RECALL' | 'VISUAL_PICTURE_RECALL' | 'GROUP_MATCHING' | 'AUDIO_WORDS_RECALL';
    name: string;
    description: string;
    max_score: number;
    order_index: number;
};

export interface QuestionItem {
    question_item_id: number;
    order: number;
    image_key: string;
    image_url: string;
    audio_url: string;
    display_text?: string;
    accepted_answers?: string;
}

export interface SessionData {
    session_id: number;
    module: Module;
    questions?: {
        question_id: number;
        prompt_text: string;
        // Image Flash specific
        items?: QuestionItem[];
        // Visual Spatial specific
        round_order?: number;
        target_image_url?: string;
        options?: {
            option_key: string;
            image_url: string;
        }[];
        // Audio Story specific
        post_instruction_text?: string;
        item?: {
            question_item_id: number;
            audio_url: string;
            image_url: string;
        };
    }[];
    instructions?: string;
    language_code?: string;
}

export interface SubmitPayload {
    question_id?: number;
    language_code?: string;
    answer_text?: string;
    answers?: {
        question_id: number;
        selected_option_key: string;
    }[];
}

export interface SubmitResponse {
    session_id: number;
    module_code: string;
    score: number;
    max_score: number;
    status: string;
    next_module_id: number | null;
}

export interface AttemptStatus {
    count: number;
    max_attempts: number;
    allowed: boolean;
}

const getModules = async (): Promise<{ modules: Module[] }> => {
    const res = await HttpService.get('/modules');
    return res.data;
};


const startSession = async (moduleId: number, userId: number, languageCode: string, resume?: boolean): Promise<SessionData> => {
    const res = await HttpService.post(`/modules/${moduleId}/session/start`, {
        user_id: userId,
        language_code: languageCode,
        resume
    });
    return res.data;
};

const getAttemptStatus = async (): Promise<AttemptStatus> => {
    const res = await HttpService.get('/modules/attempts');
    return res.data;
};

const submitSession = async (moduleId: number, sessionId: number, payload: SubmitPayload): Promise<SubmitResponse> => {
    const res = await HttpService.post(`/modules/${moduleId}/session/${sessionId}/submit`, payload);
    return res.data;
};

const GameApi = {
    getModules,
    startSession,
    submitSession,
    getAttemptStatus
};

export default GameApi;
