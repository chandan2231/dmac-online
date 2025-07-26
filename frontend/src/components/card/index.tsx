import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';

type MorenCardProps = {
  title: string;
  description?: string;
  image?: string;
  maxWidth?: number | string;
  children?: React.ReactNode;
  maxHeight?: number | string;
  minHeight?: number | string;
};

const MorenCard: React.FC<MorenCardProps> = ({
  title,
  description,
  image,
  maxWidth = '100%',
  maxHeight = '100%',
  minHeight = 0,
  children,
}) => {
  return (
    <Card
      sx={{
        m: 2,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
        minHeight: minHeight,
        width: '100%',
        boxShadow: 3,
      }}
    >
      {image && (
        <CardMedia
          component="img"
          height="140"
          image={image}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent>
        <Box mb={2}>
          <Typography gutterBottom variant="h6" component="div">
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
};

export default MorenCard;
