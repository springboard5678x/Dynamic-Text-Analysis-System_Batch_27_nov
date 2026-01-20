import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { FileText, Upload, Type, ArrowRight, File, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PageLayout from "@/components/PageLayout";
import useTextStore from "@/store/textStore";
import { toast } from "sonner";
import { analyzeForDemo } from "@/lib/nlpDemo";

const InputPage = () => {
  const navigate = useNavigate();
  const { setOriginalText, setKeywords, setLoading, setDatasetSummary, setTopicModel, setSentiment } = useTextStore();
  const [inputMethod, setInputMethod] = useState<"text" | "file" | null>(null);
  const [textInput, setTextInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setTextInput(content);
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "text/csv": [".csv"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const handleSubmit = async () => {
    if (!textInput.trim()) {
      toast.error("Please enter some text or upload a file");
      return;
    }

    setIsProcessing(true);
    setLoading(true);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    setOriginalText(textInput);
    
    // Extract keywords (simple word frequency analysis for demo)
    const words = textInput.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const wordCount: Record<string, number> = {};
    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    const keywords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([word, count]) => ({ word, count }));
    
    setKeywords(keywords);

    // "Model integration" (demo-friendly):
    // We read precomputed model outputs from `public/models/demo_outputs.json`.
    // If the file is missing, we fall back to a simple heuristic so the UI never breaks.
    const analysis = await analyzeForDemo({ text: textInput, keywords });
    setDatasetSummary(analysis.datasetSummary);
    setSentiment(analysis.sentiment.label, analysis.sentiment.score);
    setTopicModel(analysis.topicModel);

    setIsProcessing(false);
    setLoading(false);
    
    navigate("/dashboard");
  };

  const removeFile = () => {
    setUploadedFile(null);
    setTextInput("");
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Provide Your Content
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload documents, articles, reports, or datasets for analysis
            </p>
          </motion.div>

          {/* Input Method Selection */}
          {!inputMethod && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid md:grid-cols-2 gap-6 mb-8"
            >
              <button
                onClick={() => setInputMethod("text")}
                className="p-8 rounded-2xl bg-card border border-border shadow-soft card-hover text-center"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <Type className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Enter Text</h3>
                <p className="text-muted-foreground">Type or paste your text directly</p>
              </button>

              <button
                onClick={() => setInputMethod("file")}
                className="p-8 rounded-2xl bg-card border border-border shadow-soft card-hover text-center"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Upload File</h3>
                <p className="text-muted-foreground">TXT, CSV, or PDF formats</p>
              </button>
            </motion.div>
          )}

          {/* Text Input */}
          {inputMethod === "text" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Enter Your Text</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInputMethod(null)}
                >
                  Change method
                </Button>
              </div>
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste or type your text here... Articles, reports, documents, or any content you'd like to analyze."
                className="min-h-[300px] text-base resize-none bg-card border-border focus:ring-primary"
              />
              <p className="text-sm text-muted-foreground">
                {textInput.length} characters • {textInput.split(/\s+/).filter(Boolean).length} words
              </p>
            </motion.div>
          )}

          {/* File Upload */}
          {inputMethod === "file" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Upload Your File</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInputMethod(null);
                    removeFile();
                  }}
                >
                  Change method
                </Button>
              </div>

              {!uploadedFile ? (
                <div
                  {...getRootProps()}
                  className={`p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">
                    {isDragActive ? "Drop your file here" : "Drag & drop your file here"}
                  </p>
                  <p className="text-muted-foreground mb-4">or click to browse</p>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: TXT, CSV, PDF
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <File className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={removeFile}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  {textInput && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        {textInput.length} characters • {textInput.split(/\s+/).filter(Boolean).length} words extracted
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Submit Button */}
          {inputMethod && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-8 flex justify-center"
            >
              <Button
                variant="hero"
                size="lg"
                onClick={handleSubmit}
                disabled={!textInput.trim() || isProcessing}
                className="min-w-[200px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Analyze Content
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default InputPage;
