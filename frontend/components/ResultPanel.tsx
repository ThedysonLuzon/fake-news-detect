// components/ResultPanel.tsx
import {
  Box,
  Badge,
  Text,
  Divider,
  VStack,
  HStack,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

type Evidence = { doc_id: string; chunk_id: number; snippet: string };

const norm = (s: unknown) => {
  const v = String(s ?? "").trim().toLowerCase();
  if (v === "fake") return "FAKE";
  if (v === "real") return "REAL";
  return v.toUpperCase();
};

const badgeColor = (verdict: string) =>
  verdict === "FAKE" ? "red" : verdict === "REAL" ? "green" : "gray";

export function ResultPanel({ result }: { result: any }) {
  // --- Classifier verdict ---
  const clfLabelRaw: string = String(result.label ?? "");
  const clfVerdict = norm(clfLabelRaw);
  const clfColor = badgeColor(clfVerdict);
  const clfConfPct =
    typeof result.score === "number" ? (result.score * 100).toFixed(1) : null;

  // LLM verdict
  const explanation = result.explanation;
  const llmVerdict = norm(explanation?.verdict);
  const llmHasVerdict = !!explanation && !!explanation.verdict;
  const llmConfPct =
    typeof explanation?.confidence === "number"
      ? String(explanation.confidence)
      : null;
  const disagrees =
    llmHasVerdict && (llmVerdict === "FAKE" || llmVerdict === "REAL")
      ? llmVerdict !== clfVerdict
      : false;

  // Evidence
  const evidence: Evidence[] = Array.isArray(result.evidence)
    ? result.evidence
    : [];
  const legacySnips: string[] = Array.isArray(result.snippets)
    ? result.snippets
    : [];

  return (
    <Box borderWidth={1} borderRadius="md" p={4} w="100%">
      {/* Header verdict strip */}
      <HStack spacing={3} align="center">
        <Badge colorScheme={clfColor} fontSize="1em">
          Classifier: {clfVerdict || "UNKNOWN"}
        </Badge>
        {clfConfPct && (
          <Text fontSize="sm" color="gray.600">
            {clfConfPct}% confidence
          </Text>
        )}

        {llmHasVerdict && (
          <>
            <Divider orientation="vertical" height="20px" />
            <Badge colorScheme={badgeColor(llmVerdict)} fontSize="1em">
              LLM: {llmVerdict}
            </Badge>
            {llmConfPct && (
              <Text fontSize="sm" color="gray.600">
                {llmConfPct}% confidence
              </Text>
            )}
          </>
        )}
      </HStack>

      {disagrees && (
        <Alert status="warning" mt={3} borderRadius="md">
          <AlertIcon />
          The LLM explanation disagrees with the classifier. This can happen if
          retrieved evidence is off-topic or incomplete.
        </Alert>
      )}

      {/* Evidence */}
      {(evidence.length > 0 || legacySnips.length > 0) && (
        <>
          <Divider my={4} />
          <Text fontWeight="semibold" mb={2}>
            Evidence (top {evidence.length || legacySnips.length})
          </Text>
          <VStack align="start" spacing={2}>
            {evidence.map((e: Evidence, i: number) => (
              <Box key={`e-${i}`} p={2} borderWidth={1} borderRadius="md">
                <Text fontSize="xs" color="gray.500" mb={1}>
                  {e.doc_id}:{e.chunk_id}
                </Text>
                <Text fontSize="sm">{e.snippet}</Text>
              </Box>
            ))}
            {legacySnips.map((snip: string, i: number) => (
              <Box key={`s-${i}`} p={2} borderWidth={1} borderRadius="md">
                <Text fontSize="sm">{snip}</Text>
              </Box>
            ))}
          </VStack>
        </>
      )}

      {/* Explanation */}
      {explanation && (
        <>
          <Divider my={4} />
          {typeof explanation === "string" ? (
            <Box>
              <Text fontWeight="semibold" mb={1}>
                LLM Explanation
              </Text>
              <Text whiteSpace="pre-wrap">{explanation}</Text>
            </Box>
          ) : (
            <VStack align="start" spacing={2}>
              <Text fontWeight="semibold">LLM Explanation</Text>
              {explanation.explanation && (
                <Text whiteSpace="pre-wrap">{explanation.explanation}</Text>
              )}
              {explanation.suggested_correction && (
                <Box>
                  <Text fontWeight="semibold" mb={1}>
                    Suggested Correction
                  </Text>
                  <Text whiteSpace="pre-wrap">
                    {explanation.suggested_correction}
                  </Text>
                </Box>
              )}
            </VStack>
          )}
        </>
      )}
    </Box>
  );
}
