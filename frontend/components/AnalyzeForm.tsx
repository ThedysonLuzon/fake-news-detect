// components/AnalyzeForm.tsx
import { useState } from "react";
import {
  VStack,
  Textarea,
  Button,
  Text,
} from "@chakra-ui/react";
import { useAnalyze } from "../hooks/useAnalyze";

export function AnalyzeForm({
  onResult,
}: {
  onResult: (data: any) => void;
}) {
  const [text, setText] = useState("");
  const mutation = useAnalyze();

  const handleAnalyze = () => {
    mutation.mutate(text, {
      onSuccess: (data) => onResult(data),
    });
  };

  return (
    <VStack spacing={4} w="100%">
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
      >
        Analyze
      </Button>
      {mutation.error && (
        <Text color="red.500">
          Error: {(mutation.error as Error).message}
        </Text>
      )}
    </VStack>
  );
}
