import React from 'react';
import type { OverridableStringUnion } from '@mui/types';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  type TypographyVariant,
  type TypographyPropsVariantOverrides,
} from '@mui/material';

type MorenCardProps = {
  title: string;
  description?: string;
  image?: string;
  maxWidth?: number | string;
  children?: React.ReactNode;
  maxHeight?: number | string;
  minHeight?: number | string;
  descriptionVariant?:
    | OverridableStringUnion<
        'inherit' | TypographyVariant,
        TypographyPropsVariantOverrides
      >
    | undefined;
  cardStyles?: React.CSSProperties;
};

const MorenCard: React.FC<MorenCardProps> = ({
  title,
  description,
  image,
  maxWidth = '100%',
  maxHeight = '100%',
  minHeight = 0,
  children,
  descriptionVariant = 'body2',
  cardStyles = {},
}) => {
  return (
    <Card
      sx={{
        m: 2,
        maxWidth,
        maxHeight,
        minHeight,
        width: '100%',
        boxShadow: 3,
        ...cardStyles,
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
            <Typography variant={descriptionVariant} color="text.secondary">
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
