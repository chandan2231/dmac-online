import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/GridLegacy';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import LandingPageTypography from './LandingPageTypography';

const isSectionLabel = (text: string) => {
  const normalized = text.trim();
  return (
    normalized.endsWith(':') ||
    [
      'Expected Outcomes',
      'Neuroplasticity-Focused Approach',
      'LICCA Brain Training & Progress Tracking',
      'SDMAC Smart AI-Integrated Testing',
      'SDMAC Smart AI-Integrated Testing with LICCA and expert advice',
      'Personalized Medical Information Review with diagnostic test tools.',
    ].includes(normalized)
  );
};

type Offering = {
  title: string;
  subtitle?: string;
  price: string;
  paragraphs: string[];
};

const OFFERINGS: Offering[] = [
  {
    title: 'SDMAC AI 5.0',
    subtitle: 'Cognitive Assessment Test',
    price: '$39.99',
    paragraphs: [
      'Self Dynamic Mobile Assessment of Cognition (S-DMAC™) 5.0 AI — a comprehensive cognitive assessment evaluating 10 key cognitive domains.',
      'S-DMAC™ 5.0 AI is a self administered online cognitive test for 35 - 55 minutes. This cognitive assessment test is designed to provide an in-depth understanding of cognitive function using advanced, AI-integrated analysis.',
      'SDMAC smart, AI-based cognitive assessments identify weaker cognitive domains and automatically generate personalized brain-training schedules for 12 weeks within LICCA, tailored to your individual cognitive profile.',
    ],
  },
  {
    title: 'SDMAC & Expert Advice',
    subtitle:
      'Cognitive Assessment test & Expert advice to guide identify underlying medical problems contributing to memory loss.',
    price: '$299.00',
    paragraphs: [
      'Next step of RM360 protocol to guide you to optimize your body.',
      'Personalized Medical Information Review with diagnostic test tools.',
      'An individualized collection of your medical history—including relevant laboratory and blood test information—is organized to help guide medical decision-making through our expert-guided process. This approach focuses on optimizing overall health to support brain function.',
      'Our expert guidance includes licensed physicians and/or trained clinicians who help identify cognitive concerns, identify underlying causes of accelerated memory loss by standardized approach and guide you to seek appropriate evaluation and treatment with your primary care physician, neurologist, or geriatric specialist in your local area.',
    ],
  },
  {
    title: 'LICCA 5.0 AI only as upgrade',
    price: '$399.00',
    paragraphs: [
      'You are not able to buy individually.',
      'LICCA Brain Training & Progress Tracking',
      'LICCA provides structured brain-training exercises along with visual progress charts, allowing you to track improvements across multiple cognitive domains over time.',
      'Expected Outcomes',
      'With consistent participation over a 12-week (3-month) training period, many users experience improvements in memory, cognitive skills, and daily functioning. Individual results may vary.',
      'Neuroplasticity-Focused Approach',
      'Our program is designed to support neuroplasticity, the brain’s ability to adapt and form new neural connections, helping the brain reconnect or strengthen cognitive pathways.',
    ],
  },
  {
    title: 'RM360 Pack:',
    subtitle: 'SDMAC, Expert Advice & LICCA',
    price: '$599.00',
    paragraphs: [
      'Online Life integrated computerized cognitive application is AI assisted cognitive therapy',
      'SDMAC Smart AI-Integrated Testing with LICCA and expert advice',
      'SDMAC smart, AI-based cognitive assessments identify weaker cognitive domains and automatically generate body optimization with expert advice and personalized brain-training schedules for 12 weeks within LICCA, tailored to your individual cognitive profile.',
    ],
  },
  {
    title: 'RM360 pack with 6 remote training session:',
    subtitle:
      'SDMAC, Expert advice & LICCA supervised 6 session of brain training complete package',
    price: '$900.00',
    paragraphs: [
      'SDMAC Smart AI-Integrated Testing',
      'SDMAC smart, AI-based cognitive assessments identify weaker cognitive domains and automatically generate body optimization with expert advice and remote supervised 6 sessions of brain training personalized brain-training schedules for 12 weeks within LICCA, tailored to your individual cognitive profile.',
    ],
  },
];

export default function RM360Offerings() {
  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        overflow: 'hidden',
        bgcolor: theme => theme.landingPage.background,
      }}
    >
      <Container sx={{ mt: 0, mb: 15 }}>
        <LandingPageTypography
          variant="h4"
          component="h2"
          align="center"
          sx={{ mb: 6 }}
        >
          Start Your Cognitive Assessment Today
        </LandingPageTypography>

        <Grid container spacing={4}>
          {OFFERINGS.map(offering => (
            <Grid
              key={`${offering.title}-${offering.price}`}
              item
              xs={12}
              md={6}
            >
              <Paper
                variant="outlined"
                sx={theme => ({
                  p: { xs: 2.5, sm: 3 },
                  height: '100%',
                  borderRadius: 3,
                  borderColor: alpha(theme.palette.divider, 0.5),
                  backgroundColor: alpha(theme.palette.background.paper, 0.55),
                  backdropFilter: 'blur(14px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(14px) saturate(180%)',
                  transition: theme.transitions.create(
                    ['transform', 'box-shadow', 'border-color'],
                    {
                      duration: theme.transitions.duration.short,
                    }
                  ),
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[2],
                    borderColor: alpha(theme.palette.text.secondary, 0.6),
                  },
                })}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 1,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <LandingPageTypography
                      variant="h6"
                      component="h3"
                      sx={{ fontWeight: 700, lineHeight: 1.2 }}
                    >
                      {offering.title}
                    </LandingPageTypography>
                    {offering.subtitle ? (
                      <LandingPageTypography
                        variant="subtitle1"
                        sx={{ mt: 0.75, color: 'text.secondary' }}
                      >
                        {offering.subtitle}
                      </LandingPageTypography>
                    ) : null}
                  </Box>

                  <LandingPageTypography
                    variant="body2"
                    sx={theme => ({
                      whiteSpace: 'nowrap',
                      alignSelf: 'flex-start',
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 999,
                      bgcolor: alpha(theme.landingPage.primary, 0.85),
                      color: 'common.white',
                      fontWeight: 700,
                      letterSpacing: 0.2,
                    })}
                  >
                    {offering.price}
                  </LandingPageTypography>
                </Box>

                <Divider sx={{ mt: 2, mb: 1.5 }} />

                {offering.paragraphs.map((text, index) => (
                  <LandingPageTypography
                    key={`${offering.title}-p-${index}`}
                    variant={isSectionLabel(text) ? 'subtitle2' : 'body2'}
                    sx={{
                      mt: index === 0 ? 1.5 : 1,
                      color: isSectionLabel(text)
                        ? 'text.primary'
                        : 'text.secondary',
                      fontWeight: isSectionLabel(text) ? 700 : 400,
                      lineHeight: 1.6,
                    }}
                  >
                    {text}
                  </LandingPageTypography>
                ))}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
