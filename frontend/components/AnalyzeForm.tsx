// components/AnalyzeForm.tsx
import { useState } from "react";
import { VStack, Textarea, Button, Text, Input } from "@chakra-ui/react";
import { useAnalyze } from "../hooks/useAnalyze";

export function AnalyzeForm({ onResult }: { onResult: (data: any) => void }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const mutation = useAnalyze();

  const handleAnalyze = () => {
    if (!text.trim()) return;
    mutation.mutate(
      { text, title: title.trim() || undefined },
      { onSuccess: (data) => onResult(data) }
    );
  };

  return (
    <VStack spacing={4} w="100%">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Optional headline / title"
      />
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste article text here"
        minH="200px"
      />
      <Button
        onClick={handleAnalyze}
        isLoading={mutation.isLoading}
        colorScheme="blue"
        isDisabled={!text.trim()}
      >
        Analyze
      </Button>
      {mutation.error && (
        <Text color="red.500">Error: {(mutation.error as Error).message}</Text>
      )}
    </VStack>
  );
}
