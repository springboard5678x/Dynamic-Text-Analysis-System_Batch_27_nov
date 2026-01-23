'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { LoaderCircle, ArrowUp, Paperclip } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AnalysisFormProps {
  onAnalyze: (data: FormData) => void;
  isLoading: boolean;
}

export default function AnalysisForm({ onAnalyze, isLoading }: AnalysisFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setText(''); // Clear manual text input
      setStatusMessage(`1 file selected: ${selectedFile.name}`);
    }
  };

  // No more manual reading of text client-side needed for validation

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;

    // Prepare FormData
    const formData = new FormData();

    if (file) {
      formData.append('file', file);
    } else if (text.trim()) {
      // Robustness Fix: If text is huge > 500KB, send it as a file to bypass Field limits
      if (text.length > 500000) {
        const textFile = new File([text], "large_text_input.txt", { type: "text/plain" });
        formData.append('file', textFile);
      } else {
        formData.append('text', text);
      }
    } else {
      return; // Nothing to send
    }

    onAnalyze(formData);

    setText('');
    setFile(null);
    setStatusMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (statusMessage) setStatusMessage('');
    if (file) setFile(null); // Clear file if typing
  }

  const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event as unknown as React.FormEvent);
    }
  };

  const isSendable = !isLoading && (text.trim().length >= 10 || file !== null);

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl bg-card border hover:border-primary/80 hover:shadow-primary/30 transition-all duration-300">
      <CardContent className="p-3">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload a file (.txt, .csv, .docx, .pdf)</p>

              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv,.docx,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"

            onChange={handleFileChange}
            className="hidden"
            disabled={isLoading}
          />

          <Textarea
            id="text-input"
            placeholder={statusMessage || "Paste text, or upload a file for analysis..."}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleTextareaKeyDown}
            rows={1}
            className="bg-transparent focus:bg-transparent transition-colors text-base p-2 border-none focus-visible:ring-0 focus-visible:ring-offset-0 max-h-48 resize-none flex-grow"
            disabled={isLoading}
          />

          <Button
            type="submit"
            size="icon"
            className={cn(
              "flex-shrink-0 transition-all duration-300",
              isSendable && "bg-primary/90 shadow-lg shadow-primary/30"
            )}
            disabled={!isSendable}
          >
            {isLoading ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
