import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Coffee, Monitor, Shirt, Loader2, ArrowRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { generateMarketingVisual } from './services/gemini';

const MEDIUMS = [
  { id: 'coffee mug', label: 'Coffee Mug', icon: Coffee },
  { id: 'billboard in a city', label: 'Billboard', icon: Monitor },
  { id: 't-shirt worn by a model', label: 'T-Shirt', icon: Shirt },
  { id: 'tote bag', label: 'Tote Bag', icon: ImageIcon },
  { id: 'smartphone screen', label: 'Mobile App', icon: Monitor },
];

export default function App() {
  const [productImage, setProductImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [selectedMediums, setSelectedMediums] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<{ medium: string; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setProductImage(base64);
        setMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleMedium = (id: string) => {
    setSelectedMediums(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!productImage || selectedMediums.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setResults([]);

    try {
      const newResults = [];
      for (const medium of selectedMediums) {
        const url = await generateMarketingVisual(productImage, mimeType, medium);
        newResults.push({ medium, url });
      }
      setResults(newResults);
    } catch (err) {
      console.error(err);
      setError('Failed to generate visuals. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setProductImage(null);
    setMimeType('');
    setSelectedMediums([]);
    setResults([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] selection:bg-[#00FF00]">
      {/* Header Marquee */}
      <div className="border-b-2 border-black bg-black text-white overflow-hidden py-2">
        <div className="marquee-track whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-8 font-mono text-xs uppercase tracking-[0.2em]">
              MIT • Generative Marketing • Product Consistency • Powered by Gemini • 
            </span>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-12">
            <section>
              <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.85] mb-8">
                MIT
              </h1>
              <p className="text-xl font-medium max-w-md">
                Upload your product and see it across the world in seconds. 
                Consistent. Professional. Instant.
              </p>
            </section>

            {/* Upload Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono uppercase tracking-widest opacity-50">01. Upload Product</h2>
                {productImage && (
                  <button onClick={reset} className="text-xs font-mono uppercase underline hover:text-red-500">Reset</button>
                )}
              </div>
              
              {!productImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="brutal-card border-dashed cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center py-16 space-y-4"
                >
                  <Upload className="w-12 h-12" />
                  <p className="font-bold uppercase">Drop image or click to browse</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              ) : (
                <div className="brutal-card p-2 relative group">
                  <img 
                    src={`data:${mimeType};base64,${productImage}`} 
                    alt="Product" 
                    className="w-full h-64 object-contain bg-gray-50"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="brutal-btn bg-white text-sm"
                    >
                      Change Image
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              )}
            </section>

            {/* Mediums Selection */}
            <section className="space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-widest opacity-50">02. Select Mediums</h2>
              <div className="grid grid-cols-2 gap-4">
                {MEDIUMS.map((medium) => {
                  const Icon = medium.icon;
                  const isSelected = selectedMediums.includes(medium.id);
                  return (
                    <button
                      key={medium.id}
                      onClick={() => toggleMedium(medium.id)}
                      className={cn(
                        "brutal-btn text-left flex items-center space-x-3 normal-case",
                        isSelected ? "bg-[#00FF00]" : "bg-white"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{medium.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Action Button */}
            <button
              disabled={!productImage || selectedMediums.length === 0 || isGenerating}
              onClick={handleGenerate}
              className={cn(
                "w-full brutal-btn text-2xl py-6 flex items-center justify-center space-x-4",
                isGenerating ? "bg-gray-200 cursor-not-allowed" : "bg-black text-white hover:bg-[#00FF00] hover:text-black"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>Generate Visuals</span>
                  <ArrowRight className="w-8 h-8" />
                </>
              )}
            </button>

            {error && (
              <p className="text-red-500 font-mono text-sm border-2 border-red-500 p-4 bg-red-50">
                ERROR: {error}
              </p>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <div className="sticky top-12 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono uppercase tracking-widest opacity-50">03. Output Gallery</h2>
                <span className="text-xs font-mono">{results.length} / {selectedMediums.length} Generated</span>
              </div>

              {results.length === 0 && !isGenerating ? (
                <div className="brutal-card h-[600px] flex flex-col items-center justify-center text-center space-y-6 bg-gray-50 border-dashed">
                  <div className="w-24 h-24 rounded-full border-2 border-black flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 opacity-20" />
                  </div>
                  <div className="max-w-xs">
                    <p className="font-bold uppercase mb-2">No visuals generated yet</p>
                    <p className="text-sm opacity-60">Upload a product and select mediums to start the visualization process.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8">
                  <AnimatePresence mode="popLayout">
                    {results.map((result, idx) => (
                      <motion.div
                        key={result.medium}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="brutal-card group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="bg-black text-white px-3 py-1 text-xs font-mono uppercase tracking-tighter">
                            {result.medium}
                          </span>
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = result.url;
                              link.download = `mit-${result.medium.replace(/\s+/g, '-')}.png`;
                              link.click();
                            }}
                            className="p-2 hover:bg-[#00FF00] transition-colors brutal-border"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                        <img 
                          src={result.url} 
                          alt={result.medium} 
                          className="w-full aspect-video object-cover brutal-border"
                        />
                      </motion.div>
                    ))}
                    {isGenerating && results.length < selectedMediums.length && (
                      <div className="brutal-card animate-pulse bg-gray-50 h-64 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black py-12 bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-black text-2xl uppercase">MIT</div>
          <div className="flex gap-8 text-xs font-mono uppercase tracking-widest opacity-50">
            <span>© 2026 MIT</span>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
