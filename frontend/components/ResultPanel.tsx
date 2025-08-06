// components/ResultPanel.tsx
import {
  Box,
  Badge,
  Text,
  Divider,
  VStack,
} from "@chakra-ui/react";

export function ResultPanel({ result }: { result: any }) {
  const { label, score, snippets, explanation } = result;
  const color = label === "fake" ? "red" : "green";

  return (
    <Box borderWidth={1} borderRadius="md" p={4} w="100%">
      <Badge colorScheme={color} fontSize="1em">
        {label.toUpperCase()}
      </Badge>
      <Text mt={2}>
        Confidence: {(score * 100).toFixed(1)}%
      </Text>

      {snippets && (
        <>
          <Divider my={4} />
          <VStack align="start" spacing={2}>
            {snippets.map((snip: string, i: number) => (
              <Box
                key={i}
                p={2}
                borderWidth={1}
                borderRadius="md"
              >
                <Text fontSize="sm">{snip}</Text>
              </Box>
            ))}
          </VStack>
        </>
      )}

      {explanation && (
        <>
          <Divider my={4} />
          <Text>{explanation}</Text>
        </>
      )}
    </Box>
  );
}
