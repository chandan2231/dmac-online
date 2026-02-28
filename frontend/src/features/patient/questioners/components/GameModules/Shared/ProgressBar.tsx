import { Box, Typography } from '@mui/material';

interface ProgressBarProps {
    percentage: number;
}

const ProgressBar = ({ percentage }: ProgressBarProps) => {
    // Ensure percentage is between 0 and 100
    const clampedPercentage = Math.min(100, Math.max(0, percentage));

    return (
        <Box sx={{ width: '100%', position: 'relative' }}>
            <Box
                sx={{
                    width: '100%',
                    height: 24,
                    bgcolor: '#e0dfdfff',
                    borderRadius: 12,
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                }}
            >
                <Box
                    sx={{
                        width: `${clampedPercentage}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #00A6FF 0%, #0076FF 100%)',
                        borderRadius: 12,
                        transition: 'width 0.5s ease-in-out',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {clampedPercentage >= 12 && (
                        <Typography
                            sx={{
                                color: 'white',
                                fontSize: { xs: '0.8rem', sm: '0.75rem' },
                                fontWeight: { xs: 800, sm: 700 },
                                userSelect: 'none'
                            }}
                        >
                            {Math.round(clampedPercentage)}%
                        </Typography>
                    )}
                </Box>
            </Box>
            {clampedPercentage < 12 && (
                <Typography
                    sx={{
                        position: 'absolute',
                        left: {
                            xs: `calc(${clampedPercentage}% + 10px)`,
                            sm: `${clampedPercentage + 2}%`
                        },
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: { xs: '#444', sm: '#666' },
                        fontSize: { xs: '0.8rem', sm: '0.75rem' },
                        fontWeight: { xs: 800, sm: 700 },
                        userSelect: 'none'
                    }}
                >
                    {Math.round(clampedPercentage)}%
                </Typography>
            )}
        </Box>
    );
};

export default ProgressBar;
