import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LandingPageTypography from './LandingPageTypography';

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Box component="section" sx={{ width: '100%' }}>
      <LandingPageTypography
        variant="h6"
        component="h3"
        sx={{ fontWeight: 800 }}
      >
        {title}
      </LandingPageTypography>
      <Box sx={{ mt: 1.5 }}>{children}</Box>
    </Box>
  );
};

const CheckLine = ({ children }: { children: React.ReactNode }) => {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <CheckCircleOutlineIcon
        fontSize="small"
        sx={{ mt: '2px', color: 'secondary.main' }}
      />
      <LandingPageTypography variant="body2" sx={{ color: 'text.secondary' }}>
        {children}
      </LandingPageTypography>
    </Stack>
  );
};

export default function RM360Details() {
  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        overflow: 'hidden',
        bgcolor: theme => theme.landingPage.background,
      }}
    >
      <Container sx={{ mt: 10, mb: 10 }}>
        <Stack spacing={2} sx={{ mb: 6, textAlign: 'center' }}>
          <LandingPageTypography
            variant="h4"
            component="h2"
            marked="center"
            sx={{
              fontSize: {
                xs: '1rem',
                sm: '1.50rem',
                md: '1.90rem',
                lg: '1.90rem',
              },
            }}
          >
            Comprehensive Cognitive Testing with Expert Guidance & Personalized
            Brain Training
          </LandingPageTypography>
          <LandingPageTypography
            variant="subtitle1"
            sx={{ color: 'text.secondary', mx: 'auto' }}
          >
            Concerned about memory, focus, or mental clarity? RM360™ combines
            DMAC™ comprehensive online cognitive testing, expert clinical
            guidance, and personalized brain training with LICCA™—all
            accessible from home.
          </LandingPageTypography>
        </Stack>

        <Stack spacing={5} sx={{ mx: 'auto' }}>
          <Section title="What is RegainMemory360 (RM360™)?">
            <LandingPageTypography
              variant="body2"
              sx={{ color: 'text.secondary', lineHeight: 1.7 }}
            >
              RM360™ comprises S-DMAC™ 5.0 AI, a comprehensive online
              cognitive testing tool, combined with expert clinical guidance to
              help identify potential underlying and secondary treatable
              contributors to memory loss. The program is designed to support
              overall health optimization and is integrated with an
              individualized, online Life-Integrated Computerized Cognitive
              Application (LICCA™).
            </LandingPageTypography>
          </Section>

          <Divider />

          <Section title="What Is DMAC™?">
            <LandingPageTypography
              variant="body2"
              sx={{ color: 'text.secondary', lineHeight: 1.7 }}
            >
              DMAC™ (Dynamic Mobile Assessment of Cognition) is an AI-powered,
              self-administered online cognitive assessment designed to evaluate
              multiple key cognitive domains, including memory, attention,
              executive function, and processing speed.
            </LandingPageTypography>

            <Stack spacing={1.25} sx={{ mt: 2 }}>
              <CheckLine>Online and self-directed</CheckLine>
              <CheckLine>AI-integrated analysis</CheckLine>
              <CheckLine>Secure and confidential</CheckLine>
              <CheckLine>Designed for adults and caregivers</CheckLine>
            </Stack>

            <LandingPageTypography
              variant="body2"
              sx={{ mt: 2, color: 'text.secondary', lineHeight: 1.7 }}
            >
              DMAC™ helps you better understand your cognitive profile and
              supports informed discussions with your healthcare provider.
            </LandingPageTypography>
          </Section>

          <Divider />

          <Section title="Go Beyond a Brain Test">
            <LandingPageTypography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Expert Clinical Guidance Included
            </LandingPageTypography>
            <LandingPageTypography
              variant="body2"
              sx={{ mt: 1.25, color: 'text.secondary', lineHeight: 1.7 }}
            >
              Your results don’t stand alone. RM360™ includes expert clinical
              guidance to help identify possible underlying or secondary
              contributors to memory and cognitive concerns and to guide
              appropriate next steps with your primary care physician,
              neurologist, or geriatric specialist.
            </LandingPageTypography>
            <LandingPageTypography
              variant="body2"
              sx={{ mt: 1.25, color: 'text.secondary', lineHeight: 1.7 }}
            >
              This process is designed to support awareness and optimization—not
              replace medical care.
            </LandingPageTypography>
          </Section>

          <Divider />

          <Section title="Personalized Brain Training with LICCA™">
            <LandingPageTypography
              variant="body2"
              sx={{ color: 'text.secondary', lineHeight: 1.7 }}
            >
              After completing DMAC™, you may upgrade to LICCA™
              (Life-Integrated Computerized Cognitive Application)—a
              personalized online brain training program.
            </LandingPageTypography>

            <LandingPageTypography
              variant="subtitle1"
              sx={{ mt: 2, fontWeight: 700 }}
            >
              How LICCA™ Works
            </LandingPageTypography>

            <Stack spacing={1.25} sx={{ mt: 1.25 }}>
              <CheckLine>
                AI-generated training plan based on your cognitive profile
              </CheckLine>
              <CheckLine>Targets weaker cognitive domains</CheckLine>
              <CheckLine>
                Visual progress charts to track changes over time
              </CheckLine>
              <CheckLine>
                Structured exercises designed around principles of
                neuroplasticity
              </CheckLine>
              <CheckLine>
                Train your brain using your own data—not a one-size-fits-all
                program
              </CheckLine>
            </Stack>
          </Section>

          <Divider />

          <Section title="Designed to Support Neuroplasticity">
            <LandingPageTypography
              variant="body2"
              sx={{ color: 'text.secondary', lineHeight: 1.7 }}
            >
              Neuroplasticity refers to the brain’s ability to adapt and form
              new connections. RM360™ is designed to support this process
              through:
            </LandingPageTypography>
            <Stack spacing={1.25} sx={{ mt: 2 }}>
              <CheckLine>Cognitive awareness</CheckLine>
              <CheckLine>Health optimization guidance</CheckLine>
              <CheckLine>Targeted cognitive training</CheckLine>
            </Stack>
            <LandingPageTypography
              variant="body2"
              sx={{ mt: 2, color: 'text.secondary', lineHeight: 1.7 }}
            >
              Consistency matters. Many users report improved confidence and
              daily functioning with regular participation. Individual results
              may vary.
            </LandingPageTypography>
          </Section>

          <Divider />

          <Section title="Who Is This For?">
            <Stack spacing={1.25}>
              <CheckLine>
                Adults experiencing memory or focus concerns
              </CheckLine>
              <CheckLine>
                Individuals with cognitive changes after illness or injury
              </CheckLine>
              <CheckLine>
                Caregivers seeking structured cognitive insights
              </CheckLine>
              <CheckLine>
                Health-conscious adults wanting baseline cognitive awareness
              </CheckLine>
            </Stack>
          </Section>

          <Divider />

          <Section title="Research & Medical Leadership">
            <LandingPageTypography
              variant="body2"
              sx={{ color: 'text.secondary', lineHeight: 1.7 }}
            >
              RM360™, DMAC™ 5.0 AI, and LICCA™ are researched and developed
              using data from thousands of patients and healthy control subjects
              by:
            </LandingPageTypography>

            <Box sx={{ mt: 2 }}>
              <LandingPageTypography
                variant="subtitle1"
                sx={{ fontWeight: 800 }}
              >
                Suresh Kumar, M.D. (Diplomate, ABPN-TBIM)
              </LandingPageTypography>
              <LandingPageTypography
                variant="body2"
                sx={{ mt: 0.75, color: 'text.secondary' }}
              >
                Triple board-certified Neurologist practicing in the United
                States
              </LandingPageTypography>
              <LandingPageTypography
                variant="body2"
                sx={{ mt: 0.5, color: 'text.secondary' }}
              >
                Over 25 years of clinical and research experience
              </LandingPageTypography>
            </Box>
          </Section>
        </Stack>
      </Container>
    </Box>
  );
}
