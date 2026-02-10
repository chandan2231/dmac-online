import { Box, Container, Divider, Typography } from '@mui/material';
import AppAppBar from '../../features/landing-page/components/AppBar';
import AppFooter from '../../features/landing-page/components/AppFooter';

const TermsOfServicePage = () => {
  const currentDate = new Date();
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  return (
    <>
      <AppAppBar />
      <Box sx={{ bgcolor: 'background.default', py: { xs: 4, sm: 6 } }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h1" gutterBottom>
            Terms of Service
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Last updated: [
            {currentDate.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
            ]
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" component="h2" gutterBottom>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing or using this application (“Service”), you agree to be
            bound by these Terms of Service (“Terms”). If you do not agree to
            these Terms, you must not use the Service.
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom>
            2. Description of Service
          </Typography>
          <Typography variant="body1" paragraph>
            The Service allows users to authenticate using Google and optionally
            integrate with Google Calendar to perform actions such as creating,
            reading, or managing calendar events as requested by the user.
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom>
            3. Eligibility
          </Typography>
          <Typography variant="body1" paragraph>
            You must be legally capable of entering into a binding agreement to
            use this Service. By using the Service, you represent and warrant
            that you meet this requirement.
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom>
            4. Google Account & Authorization
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
            <li>
              The Service may require you to sign in using your Google account.
            </li>
            <li>
              By granting permissions, you authorize the Service to access
              Google Calendar data only for the features you explicitly use.
            </li>
            <li>
              You may revoke access at any time through your Google Account
              settings.
            </li>
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 3 }}>
            5. Use of Google API Data
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
            <li>
              Google Calendar data is used strictly to provide core
              functionality.
            </li>
            <li>
              The Service does not use Google user data for advertising or
              marketing.
            </li>
            <li>
              All usage complies with the Google API Services User Data Policy,
              including Limited Use requirements.
            </li>
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 3 }}>
            6. User Responsibilities
          </Typography>
          <Typography variant="body1" paragraph>
            You agree:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
            <li>Not to misuse the Service</li>
            <li>Not to attempt unauthorized access to systems or data</li>
            <li>To comply with all applicable laws and regulations</li>
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 3 }}>
            7. Data Privacy
          </Typography>
          <Typography variant="body1" paragraph>
            Your use of the Service is also governed by our Privacy Policy,
            available at: <a href={`${baseUrl}/privacy-policy`}>{`${baseUrl}/privacy-policy`}</a>
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom>
            8. Service Availability
          </Typography>
          <Typography variant="body1" paragraph>
            We strive to keep the Service available but do not guarantee
            uninterrupted or error-free operation. We may modify, suspend, or
            discontinue any part of the Service at any time without notice.
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom>
            9. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            To the maximum extent permitted by law, we shall not be liable for
            any indirect, incidental, special, or consequential damages arising
            from your use of the Service.
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom>
            10. Termination
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to suspend or terminate access to the Service
            if you violate these Terms or misuse the Service.
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom>
            11. Changes to Terms
          </Typography>
          <Typography variant="body1" paragraph>
            We may update these Terms from time to time. Continued use of the
            Service after changes indicates acceptance of the updated Terms.
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom>
            12. Governing Law
          </Typography>
          <Typography variant="body1" paragraph>
            These Terms shall be governed and interpreted in accordance with the
            laws of India, without regard to conflict of law principles.
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom>
            13. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            For questions or concerns regarding these Terms, contact us at:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
            <li>Email: regainmemory.contact@gmail.com</li>
            <li>Website: <a href={baseUrl}>{baseUrl}</a></li>
          </Typography>
        </Container>
      </Box>
      <AppFooter />
    </>
  );
};

export default TermsOfServicePage;
