"use client";
import { useState, useEffect } from "react";
import { Cpu } from "lucide-react";

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (model: string) => void;
}

export default function ModelSelector({
  currentModel,
  onModelChange,
}: ModelSelectorProps) {
  const [models, setModels] = useState<string[]>(["llama3.2"]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((data) => {
        if (data.models) setModels(data.models);
      })
      .catch(() => {
        setModels(["llama3.2", "llama3.1", "gemma2", "mistral"]);
      });
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-800 transition-colors text-sm"
      >
        <Cpu className="w-4 h-4 text-blue-400" />
        <span className="text-gray-200">{currentModel}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[180px]">
          {models.map((model) => (
            <button
              key={model}
              onClick={() => {
                onModelChange(model);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                model === currentModel
                  ? "text-blue-400 bg-gray-700/50"
                  : "text-gray-300"
              }`}
            >
              {model}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}