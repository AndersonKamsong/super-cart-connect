import React from 'react';
import { Button, Box } from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';

interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  multiple?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, multiple = false }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onUpload(files);
    }
  };

  return (
    <Box>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        type="file"
        multiple={multiple}
        onChange={handleFileChange}
      />
      <label htmlFor="image-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<UploadIcon />}
        >
          Upload Images
        </Button>
      </label>
    </Box>
  );
};

export default ImageUpload;