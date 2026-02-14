import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GenericModal from '../../../../components/modal';
import AdminService from '../../admin.service';

interface AssessmentReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number | null;
    userName: string;
}

interface ModuleResult {
    name: string;
    score: number;
    max_score: number;
    timeTaken: number;
    isTime: boolean;
}

interface CategoryResult {
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
    modules: ModuleResult[];
}

interface ReportData {
    categories: CategoryResult[];
    totalScore: number;
    totalMaxScore: number;
}

const AssessmentReportModal: React.FC<AssessmentReportModalProps> = ({
    isOpen,
    onClose,
    userId,
    userName,
}) => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchReport(userId);
        } else {
            setReportData(null);
            setError(null);
        }
    }, [isOpen, userId]);

    const fetchReport = async (id: number) => {
        setLoading(true);
        setError(null);
        const result = await AdminService.getUserAssessmentReport(id);
        if (result.success) {
            setReportData(result.data);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <GenericModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Assessment Report - ${userName}`}
            hideCancelButton
        >
            <Box sx={{ minWidth: '500px', maxHeight: '70vh', overflowY: 'auto' }}>
                {loading && (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Typography color="error" align="center" p={2}>
                        {error}
                    </Typography>
                )}

                {!loading && !error && !reportData && (
                    <Typography align="center" p={2}>
                        No report data available.
                    </Typography>
                )}

                {!loading && reportData && (
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Box
                            p={2}
                            bgcolor="#f5f5f5"
                            borderRadius={2}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography variant="h6">Overall Score</Typography>
                            <Box textAlign="right">
                                <Typography variant="h5" color="primary" fontWeight="bold">
                                    {reportData.totalScore.toFixed(2)} / {reportData.totalMaxScore}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {((reportData.totalScore / reportData.totalMaxScore) * 100).toFixed(1)}%
                                </Typography>
                            </Box>
                        </Box>

                        <Typography variant="h6" mt={1}>
                            Categories & Modules
                        </Typography>

                        {reportData.categories.map((category, index) => (
                            <Accordion key={index} defaultExpanded>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        width="100%"
                                        alignItems="center"
                                        pr={2}
                                    >
                                        <Typography fontWeight="600">{category.name}</Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {category.score.toFixed(2)} / {category.maxScore}
                                        </Typography>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box display="flex" flexDirection="column" gap={1}>
                                        {category.modules.length > 0 ? (
                                            category.modules.map((mod, mIndex) => (
                                                <Box
                                                    key={mIndex}
                                                    display="flex"
                                                    justifyContent="space-between"
                                                    p={1}
                                                    bgcolor="#fafafa"
                                                    borderRadius={1}
                                                    border="1px solid #eee"
                                                >
                                                    <Typography variant="body2">{mod.name}</Typography>
                                                    <Typography variant="body2" fontWeight="500">
                                                        {mod.score != null ? Number(mod.score).toFixed(2) : '0.00'} / {mod.max_score}
                                                    </Typography>
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="textSecondary" fontStyle="italic">
                                                No modules completed in this category.
                                            </Typography>
                                        )}
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                )}
            </Box>
        </GenericModal>
    );
};

export default AssessmentReportModal;
