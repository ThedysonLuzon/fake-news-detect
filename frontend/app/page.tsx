// app/page.tsx
"use client";  // ← add this line

import { useState } from "react";
import { Box, Container, Heading } from "@chakra-ui/react";
import { AnalyzeForm } from "../components/AnalyzeForm";
import { ResultPanel } from "../components/ResultPanel";

export default function Home() {
  const [result, setResult] = useState<any>(null);

  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={6} textAlign="center">
        Fake News Detector
      </Heading>

      <AnalyzeForm onResult={(data) => setResult(data)} />

      {result && (
        <Box mt={8}>
          <ResultPanel result={result} />
        </Box>
      )}
    </Container>
  );
}
