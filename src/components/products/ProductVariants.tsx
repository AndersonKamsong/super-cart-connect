import { useState } from 'react';
import { ProductVariant, ProductOption } from '@/types/products';
// import './ProductVariants.css';

interface ProductVariantsProps {
  variants: ProductVariant[];
  options: ProductOption[];
  onSelectVariant: (variantId: string) => void;
}

const ProductVariants = ({ variants, options, onSelectVariant }: ProductVariantsProps) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const handleOptionChange = (optionName: string, value: string) => {
    const newSelectedOptions = {
      ...selectedOptions,
      [optionName]: value
    };
    setSelectedOptions(newSelectedOptions);
    
    // Find matching variant
    const matchedVariant = variants.find(variant => 
      Object.entries(newSelectedOptions).every(([key, val]) => 
        variant.options[key] === val
      )
    );
    
    if (matchedVariant) {
      onSelectVariant(matchedVariant._id || matchedVariant.id);
    }
  };

  return (
    <div className="product-variants">
      {options.map((option) => (
        <div key={option.name} className="variant-option">
          <h4>{option.name}</h4>
          <div className="option-values">
            {option.values.map((value) => (
              <button
                key={value}
                className={`option-value ${
                  selectedOptions[option.name] === value ? 'selected' : ''
                }`}
                onClick={() => handleOptionChange(option.name, value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductVariants;