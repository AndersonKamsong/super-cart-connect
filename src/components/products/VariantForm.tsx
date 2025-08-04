import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Chip,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface VariantFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (variant: any) => void;
  options: { name: string; values: string[] }[];
}

const VariantForm: React.FC<VariantFormProps> = ({ open, onClose, onSave, options }) => {
  const [variantOptions, setVariantOptions] = useState<Record<string, string>>({});
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [sku, setSku] = useState<string>('');

  const handleOptionSelect = (optionName: string, value: string) => {
    setVariantOptions({
      ...variantOptions,
      [optionName]: value,
    });
  };

  const handleSubmit = () => {
    const newVariant = {
      _id: Date.now().toString(), // Temporary ID
      options: variantOptions,
      price,
      stock,
      sku,
    };
    onSave(newVariant);
    handleClose();
  };

  const handleClose = () => {
    setVariantOptions({});
    setPrice(0);
    setStock(0);
    setSku('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Product Variant</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Variant Options */}
          {options.map((option) => (
            <Grid item xs={12} key={option.name}>
              <Typography variant="subtitle1" gutterBottom>
                {option.name}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {option.values.map((value) => (
                  <Chip
                    key={value}
                    label={value}
                    onClick={() => handleOptionSelect(option.name, value)}
                    color={
                      variantOptions[option.name] === value ? 'primary' : 'default'
                    }
                  />
                ))}
              </Box>
            </Grid>
          ))}

          {/* Variant Details */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value, 10))}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="SKU"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={Object.keys(variantOptions).length === 0}
        >
          Add Variant
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VariantForm;