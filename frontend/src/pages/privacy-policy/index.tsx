import { Box, Container, Divider, Typography } from '@mui/material';
import AppAppBar from '../../features/landing-page/components/AppBar';
import AppFooter from '../../features/landing-page/components/AppFooter';

const PrivacyPolicyPage = () => {
  const currentDate = new Date();
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  return (
    <>
      <AppAppBar />
      <Box sx={{ bgcolor: 'background.default', py: { xs: 4, sm: 6 } }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h1" gutterBottom>
            Privacy Policy
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
            Introduction
          </Typography>
          <Typography variant="body1" paragraph>
            We respect your privacy and are committed to protecting your
            personal data. This Privacy Policy explains how we collect, use, and
            safeguard information when you use our application that integrates
            with Google services, including Google Calendar.
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom>
            Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            When you sign in using Google or authorize Google Calendar access,
            we may collect:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
            <li>Your name and email address</li>
            <li>Google account identifier</li>
            <li>
              Calendar-related data (such as event titles, dates, and times)
              only if explicitly authorized
            </li>
          </Typography>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            We do not collect sensitive personal data unless required for the
            core functionality of the application.
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom>
            Use of Google Calendar Data
          </Typography>
          <Typography variant="body1" paragraph>
            We use Google Calendar data only to provide the features requested
            by you, such as:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
            <li>Creating calendar events</li>
            <li>
              Reading or updating events related to the application’s
              functionality
            </li>
          </Typography>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            We do not use Google Calendar data for:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
            <li>Advertising</li>
            <li>Marketing</li>
            <li>Data analytics unrelated to core functionality</li>
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 3 }}>
            Data Sharing
          </Typography>
          <Typography variant="body1" paragraph>
            We do not sell, rent, or share your personal or Google Calendar data
            with third parties, except:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
            <li>When required by law</li>
            <li>To comply with Google API policies</li>
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 3 }}>
            Data Storage and Security
          </Typography>
          <Typography variant="body1" paragraph>
            We implement reasonable technical and organizational measures to
            protect your data from unauthorized access, loss, or misuse.
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom>
            Data Retention and Deletion
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
            <li>
              Google Calendar data is retained only as long as necessary to
              provide the service
            </li>
            <li>
              You may revoke access at any time from your Google Account
              settings
            </li>
            <li>
              Upon revocation, all stored calendar-related data is deleted from
              our systems
            </li>
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 3 }}>
            Google API Services Compliance
          </Typography>
          <Typography variant="body1" paragraph>
            Our use of information received from Google APIs adheres to the
            Google API Services User Data Policy, including the Limited Use
            requirements.
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom>
            Your Rights
          </Typography>
          <Typography variant="body1" paragraph>
            You have the right to:
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
            <li>Request access to your data</li>
            <li>Request correction or deletion of your data</li>
            <li>Withdraw consent at any time</li>
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 3 }}>
            Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about this Privacy Policy, please contact
            us at:
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

export default PrivacyPolicyPage;
