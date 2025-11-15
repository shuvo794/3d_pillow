import { ChevronDown, Search, ShoppingCart, User } from 'lucide-react';
import { useRef, useState } from 'react';
import { RotateCw, Ruler, Upload } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '../components/ui/button';
export default function PillowDesigner() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState('$70');
  const [notes, setNotes] = useState('');
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const sizes = [
    { label: '$60', price: '$60', original: '$85', size: '18"', inches: 18 },
    { label: '$70', price: '$70', original: '$100', size: '22"', inches: 22 },
    { label: '$90', price: '$90', original: '$120', size: '26"', inches: 26 }
  ];

  const removeBackground = (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Keep original shape, just replace removed background with white
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          // If pixel is already transparent (background removed)
          if (a < 10) {
            // Keep it transparent, don't replace
            data[i + 3] = 0;
          }
          // If light background that should be removed
          else if ((r > 240 && g > 240 && b > 240) || a < 128) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = 255;
          }
          // Keep the actual image content as is
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Calculate dimensions in inches based on selected size
        const selectedSizeObj = sizes.find(s => s.label === selectedSize);
        const baseInches = selectedSizeObj ? selectedSizeObj.inches : 22;
        
        const aspectRatio = img.width / img.height;
        let width, height;
        
        if (aspectRatio > 1) {
          width = baseInches;
          height = baseInches / aspectRatio;
        } else {
          height = baseInches;
          width = baseInches * aspectRatio;
        }
        
        setDimensions({
          width: width.toFixed(2),
          height: height.toFixed(2)
        });
        
        resolve(canvas.toDataURL());
      };
      img.src = imageUrl;
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const originalImage = event.target.result;
        setUploadedImage(originalImage);
        
        // Process image to remove background
        const processed = await removeBackground(originalImage);
        setProcessedImage(processed);
        setAutoRotate(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setAutoRotate(false);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setRotation(prev => ({
        x: prev.x + deltaY * 0.5,
        y: prev.y + deltaX * 0.5
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetRotation = () => {
    setRotation({ x: 0, y: 0 });
    setAutoRotate(true);
  };

  // Auto rotation effect
  useEffect(() => {
    if (autoRotate && processedImage) {
      const animate = () => {
        setRotation(prev => ({
          x: prev.x,
          y: prev.y + 0.5
        }));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [autoRotate, processedImage]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Recalculate dimensions when size changes
  useEffect(() => {
    if (uploadedImage) {
      removeBackground(uploadedImage).then(processed => {
        setProcessedImage(processed);
      });
    }
  }, [selectedSize]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-purple-500 p-4 md:p-8">
     
     
     
     
      {/* Header */ }
      <nav className="bg-gradient-to-r from-purple-dark to-purple-medium text-white py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'cursive' }}>
            All About Vibe
          </h1>
          
          <div className="hidden md:flex items-center gap-6">
            <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              Shop By Vibe <ChevronDown size={16} />
            </button>
            <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              Shop <ChevronDown size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm">
            <button className="hover:opacity-80 transition-opacity">Stories</button>
            <button className="hover:opacity-80 transition-opacity">Order Status</button>
            <button className="hover:opacity-80 transition-opacity">Help</button>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Search size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <User size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ShoppingCart size={20} />
            </Button>
          </div>
        </div>
      </div>
    </nav>

    


      <div className="max-w-7xl mx-auto mt-10 grid md:grid-cols-2 gap-8">
        {/* Left Side - 3D Preview */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8">
          <div 
            className="relative bg-white rounded-2xl overflow-hidden cursor-move select-none"
            style={{ height: '500px' }}
            onMouseDown={handleMouseDown}
          >
            {processedImage ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Measurement Lines */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
                  <div className="h-64 w-px bg-purple-500 relative">
                    <div className="absolute -left-2 top-0 w-5 h-px bg-purple-500"></div>
                    <div className="absolute -left-2 bottom-0 w-5 h-px bg-purple-500"></div>
                  </div>
                  <div className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold mt-2">
                    {dimensions.height}"
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                  <div className="w-64 h-px bg-purple-500 relative">
                    <div className="absolute left-0 -top-2 h-5 w-px bg-purple-500"></div>
                    <div className="absolute right-0 -top-2 h-5 w-px bg-purple-500"></div>
                  </div>
                  <div className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold mt-2">
                    {dimensions.width}"
                  </div>
                </div>

                {/* 3D Image - Balloon/Pillow inflated effect */}
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transformStyle: 'preserve-3d',
                    transition: isDragging ? 'none' : 'transform 0.1s linear'
                  }}
                >
                  <div style={{ position: 'relative', transformStyle: 'preserve-3d' }}>
                    {/* Main Front Image */}
                    <img 
                      src={processedImage}
                      alt="3D Preview"
                      className="object-contain"
                      style={{
                        filter: 'brightness(1.05)',
                        transform: 'translateZ(60px)',
                        maxWidth: '350px',
                        maxHeight: '450px',
                        width: 'auto',
                        height: 'auto'
                      }}
                    />
                    
                    {/* Depth layers for inflated/3D effect */}
                    {[50, 40, 30, 20, 10, 0, -10, -20, -30, -40].map((z, index) => (
                      <img 
                        key={index}
                        src={processedImage}
                        alt=""
                        className="object-contain"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          filter: `brightness(${1 - index * 0.03}) blur(${index * 0.3}px)`,
                          transform: `translateZ(${z}px) scale(${1 - index * 0.005})`,
                          maxWidth: '350px',
                          maxHeight: '450px',
                          width: 'auto',
                          height: 'auto',
                          opacity: 0.85 - index * 0.05,
                          pointerEvents: 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center h-full cursor-pointer hover:bg-gray-50 transition-all rounded-2xl bg-white">
                <div className="text-center p-8">
                  <div className="bg-purple-500 hover:bg-purple-600 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all shadow-lg">
                    <Upload className="w-10 h-10" />
                  </div>
                  <p className="text-gray-700 font-bold text-xl mb-2">Upload Your Image</p>
                  <p className="text-gray-500 text-sm mb-4">Background will be automatically removed</p>
                  <div className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-full inline-block transition-all shadow-lg">
                    Choose Image
                  </div>
                  <p className="text-gray-400 text-xs mt-4">Supports: JPG, PNG, GIF</p>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          {processedImage && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={resetRotation}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-all"
              >
                <RotateCw className="w-5 h-5" />
                {autoRotate ? 'Auto Rotating' : 'Reset & Auto'}
              </button>
              <label className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer">
                <Upload className="w-5 h-5" />
                Change Image
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
          
          <p className="text-center text-gray-600 mt-4 text-sm">
            {processedImage ? '💡 Drag to manually rotate or let it auto-rotate' : ''}
          </p>

          {/* Dimensions Display */}
          {processedImage && (
            <div className="mt-4 bg-purple-100 rounded-xl p-4 flex items-center justify-center gap-4">
              <Ruler className="w-6 h-6 text-purple-600" />
              <div className="text-center">
                <p className="text-sm text-gray-600 font-semibold">Pillow Dimensions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {dimensions.width}" × {dimensions.height}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Design Panel */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8">
          <h2 className="text-3xl font-black text-purple-600 mb-4">Design Review</h2>
          <p className="text-gray-600 mb-6">Review the steps below to personalize your custom pillow</p>

          {/* Upload Image */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="font-bold text-gray-700">Create Pillow:</label>
              <label className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full cursor-pointer transition-all font-semibold">
                UPLOAD IMAGE
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Add Notes */}
          {/* <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="font-bold text-gray-700">Add Notes:</label>
              <button 
                onClick={() => document.getElementById('notes').focus()}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full transition-all font-semibold"
              >
                EDIT NOTES
              </button>
            </div>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="As is"
              className="w-full border-2 border-gray-300 rounded-xl p-3 focus:border-purple-500 focus:outline-none resize-none"
              rows="3"
            />
          </div> */}

          {/* Size Selection */}
          <div className="mb-8">
            <label className="font-bold text-gray-700 block mb-3">Size:</label>
            <div className="grid grid-cols-3 gap-3">
              {sizes.map((size) => (
                <button
                  key={size.label}
                  onClick={() => setSelectedSize(size.label)}
                  className={`py-4 px-3 rounded-xl font-bold transition-all border-3 ${
                    selectedSize === size.label
                      ? 'bg-purple-500 text-white border-purple-600 shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-1">{size.size}</div>
                  <div className="text-sm line-through text-gray-400">{size.original}</div>
                  <div className="text-xl">{size.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-600 text-center mb-6">
            *By uploading an image you agree to our <span className="text-purple-600 underline cursor-pointer">Terms of Service</span>
          </p>

          {/* Upload Button */}
          <label className="block">
            <div className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-black py-4 px-8 rounded-full text-center cursor-pointer transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-3">
              <Upload className="w-6 h-6" />
              UPLOAD MY PHOTO
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}