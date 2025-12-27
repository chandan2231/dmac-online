import HttpService from './HttpService';

export interface Module {
    id: number;
    code: 'IMAGE_FLASH' | 'VISUAL_SPATIAL' | 'AUDIO_STORY' | 'CONNECT_DOTS' | 'AUDIO_WORDS' | 'EXECUTIVE';
    name: string;
    order_index: number;
    max_score: number;
}

export interface QuestionItem {
    question_item_id: number;
    order: number;
    image_key: string;
    image_url: string;
    audio_url: string;
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

const getModules = async (): Promise<{ modules: Module[] }> => {
    const res = await HttpService.get('/modules');
    return res.data;
};

const startSession = async (moduleId: number, userId: number, languageCode: string): Promise<SessionData> => {
    const res = await HttpService.post(`/modules/${moduleId}/session/start`, {
        user_id: userId,
        language_code: languageCode
    });
    return res.data;
};

const submitSession = async (moduleId: number, sessionId: number, payload: SubmitPayload): Promise<SubmitResponse> => {
    const res = await HttpService.post(`/modules/${moduleId}/session/${sessionId}/submit`, payload);
    return res.data;
};

const GameApi = {
    getModules,
    startSession,
    submitSession
};

export default GameApi;
