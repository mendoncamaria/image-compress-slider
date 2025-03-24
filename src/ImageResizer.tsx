// ImageResizer.tsx
import React, { useState, useRef, useEffect } from 'react';
import './styles.css';

const ImageResizer: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showActionForm, setShowActionForm] = useState(false);
  const [resizeUnit, setResizeUnit] = useState<'pixels' | 'percentage'>(
    'pixels'
  );
  const [resizeWidth, setResizeWidth] = useState<number | string>('');
  const [resizeHeight, setResizeHeight] = useState<number | string>('');
  const [resizePercentage, setResizePercentage] = useState<number | string>('');
  const [quality, setQuality] = useState(80);
  const [imageDimensions, setImageDimensions] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [imageResized, setImageResized] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (resizeUnit === 'pixels') {
        setImageDimensions(
          `Image Dimensions: ${resizeWidth} x ${resizeHeight} pixels`
        );
      } else {
        const percentage = parseInt(resizePercentage.toString());
        if (!isNaN(percentage) && previewRef.current) {
          const width = (previewRef.current.width * percentage) / 100;
          const height = (previewRef.current.height * percentage) / 100;
          setImageDimensions(
            `Image Dimensions: ${Math.round(width)} x ${Math.round(
              height
            )} pixels`
          );
        }
      }
    };

    updateDimensions();
  }, [resizeWidth, resizeHeight, resizePercentage, resizeUnit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setImageSrc(event.target.result);
          setShowActionForm(true);
          showImageDimensions(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const showImageDimensions = (file: File) => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions(
        `Image Dimensions: ${img.width} x ${img.height} pixels`
      );
    };
    img.src = URL.createObjectURL(file);
  };

  const handleResize = () => {
    if (imageResized) {
      return;
    }

    let widthValue: number;
    let heightValue: number;

    if (resizeUnit === 'percentage') {
      const percentage = parseInt(resizePercentage.toString());
      if (isNaN(percentage) || percentage < 1 || percentage > 100) {
        alert('Please enter a valid percentage (1-100).');
        return;
      }
      if (previewRef.current) {
        widthValue = (previewRef.current.width * percentage) / 100;
        heightValue = (previewRef.current.height * percentage) / 100;
        setResizeWidth(widthValue);
        setResizeHeight(heightValue);
      } else {
        return;
      }
    } else {
      widthValue = parseInt(resizeWidth.toString());
      heightValue = parseInt(resizeHeight.toString());
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      if (ctx && previewRef.current) {
        canvas.width = widthValue;
        canvas.height = heightValue;
        ctx.drawImage(img, 0, 0, widthValue, heightValue);
        const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);
        setImageSrc(dataUrl);
        setDownloadUrl(dataUrl);
        setImageResized(true);
      }
    };

    if (previewRef.current) {
      img.src = previewRef.current.src;
    }
  };

  return (
    <div className="container">
      <h1 className="title">Image Resizer and Compressor</h1>
      <div className="image-upload">
        <label htmlFor="imageInput" className="upload-label">
          <i className="fas fa-cloud-upload-alt"></i> Upload an Image
        </label>
        <input
          type="file"
          id="imageInput"
          accept="image/*"
          onChange={handleImageChange}
          ref={imageInputRef}
        />
      </div>
      {showActionForm && (
        <div id="action-form">
          <div className="output">
            <h2 className="preview-label">Preview:</h2>
            <img
              id="preview"
              alt="Preview"
              src={imageSrc || undefined}
              ref={previewRef}
            />
            <p id="image-dimensions" style={{ marginTop: '10px' }}>
              {imageDimensions}
            </p>
          </div>
          <div className="controls">
            <div className="control-group">
              <label htmlFor="resizeUnit">Unit:</label>
              <select
                id="resizeUnit"
                value={resizeUnit}
                onChange={(e) =>
                  setResizeUnit(e.target.value as 'pixels' | 'percentage')
                }
              >
                <option value="pixels">Pixels</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
            {resizeUnit === 'pixels' ? (
              <>
                <div className="control-group" id="pixel-dimensions">
                  <label htmlFor="resizeWidth">Width:</label>
                  <input
                    type="number"
                    id="resizeWidth"
                    placeholder="Width"
                    value={resizeWidth}
                    onChange={(e) => setResizeWidth(e.target.value)}
                  />
                  <span>px</span>
                </div>
                <div className="control-group" id="pixel-height-dimensions">
                  <label htmlFor="resizeHeight">Height:</label>
                  <input
                    type="number"
                    id="resizeHeight"
                    placeholder="Height"
                    value={resizeHeight}
                    onChange={(e) => setResizeHeight(e.target.value)}
                  />
                  <span>px</span>
                </div>
              </>
            ) : (
              <div className="control-group" id="percentage-dimensions">
                <label htmlFor="resizePercentage">Percent:</label>
                <input
                  type="number"
                  id="resizePercentage"
                  placeholder="Percentage"
                  min="1"
                  max="100"
                  value={resizePercentage}
                  onChange={(e) => setResizePercentage(e.target.value)}
                />
                <span>%</span>
              </div>
            )}
            <div className="control-group quality-group">
              <label htmlFor="quality">Quality:</label>
              <input
                type="range"
                id="quality"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
              />
              <span id="quality-value" className="quality-value">
                {quality}
              </span>
            </div>
            <button id="resizeButton" onClick={handleResize}>
              Resize & Compress
            </button>
            {downloadUrl && (
              <a
                id="downloadButton"
                className="download-button"
                href={downloadUrl}
                download="compressed-image.jpg"
              >
                Download Compressed Image
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageResizer;
