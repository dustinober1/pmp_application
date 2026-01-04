/**
 * Test script to verify answer randomization and even distribution
 */

import { pickRandomQuestions } from "./src/lib/questions";

// Mock questions data for testing
const mockQuestions = [
  {
    id: "q-1",
    domain: "Domain 1",
    task: "Task 1",
    questionText: "Question 1",
    answers: [
      { text: "Answer A", isCorrect: false },
      { text: "Answer B", isCorrect: true },
      { text: "Answer C", isCorrect: false },
      { text: "Answer D", isCorrect: false },
    ],
    correctAnswerIndex: 1,
    remediation: {
      coreLogic: "Logic 1",
      pmiMindset: "PMI 1",
      theTrap: "Trap 1",
      sourceLink: "",
    },
  },
  {
    id: "q-2",
    domain: "Domain 1",
    task: "Task 2",
    questionText: "Question 2",
    answers: [
      { text: "Answer A", isCorrect: true },
      { text: "Answer B", isCorrect: false },
      { text: "Answer C", isCorrect: false },
      { text: "Answer D", isCorrect: false },
    ],
    correctAnswerIndex: 0,
    remediation: {
      coreLogic: "Logic 2",
      pmiMindset: "PMI 2",
      theTrap: "Trap 2",
      sourceLink: "",
    },
  },
  {
    id: "q-3",
    domain: "Domain 2",
    task: "Task 1",
    questionText: "Question 3",
    answers: [
      { text: "Answer A", isCorrect: false },
      { text: "Answer B", isCorrect: false },
      { text: "Answer C", isCorrect: true },
      { text: "Answer D", isCorrect: false },
    ],
    correctAnswerIndex: 2,
    remediation: {
      coreLogic: "Logic 3",
      pmiMindset: "PMI 3",
      theTrap: "Trap 3",
      sourceLink: "",
    },
  },
  {
    id: "q-4",
    domain: "Domain 2",
    task: "Task 2",
    questionText: "Question 4",
    answers: [
      { text: "Answer A", isCorrect: false },
      { text: "Answer B", isCorrect: false },
      { text: "Answer C", isCorrect: false },
      { text: "Answer D", isCorrect: true },
    ],
    correctAnswerIndex: 3,
    remediation: {
      coreLogic: "Logic 4",
      pmiMindset: "PMI 4",
      theTrap: "Trap 4",
      sourceLink: "",
    },
  },
];

// Test function
export function testAnswerRandomization() {
  console.log("Testing answer randomization...\n");

  // Test multiple times to see distribution
  const distributions = [];
  const numTests = 1000;

  for (let i = 0; i < numTests; i++) {
    const randomized = pickRandomQuestions(mockQuestions, 4);
    const distribution = [0, 0, 0, 0];

    randomized.forEach((q) => {
      distribution[q.correctAnswerIndex]++;
    });

    distributions.push(distribution);
  }

  // Calculate average distribution
  const avgDistribution = [0, 0, 0, 0];
  distributions.forEach((d) => {
    d.forEach((count, index) => {
      avgDistribution[index] += count;
    });
  });

  avgDistribution.forEach((total, index) => {
    avgDistribution[index] = total / numTests;
  });

  console.log("Average distribution over", numTests, "tests:");
  console.log("A (index 0):", avgDistribution[0].toFixed(2));
  console.log("B (index 1):", avgDistribution[1].toFixed(2));
  console.log("C (index 2):", avgDistribution[2].toFixed(2));
  console.log("D (index 3):", avgDistribution[3].toFixed(2));

  console.log("\nSample randomized questions:");
  const sample = pickRandomQuestions(mockQuestions, 4);
  sample.forEach((q, index) => {
    console.log(`\nQuestion ${index + 1}:`);
    console.log("Text:", q.questionText);
    console.log(
      "Correct Answer Index:",
      q.correctAnswerIndex,
      "(${String.fromCharCode(65 + q.correctAnswerIndex)})",
    );
    q.answers.forEach((ans, ansIndex) => {
      const marker = ans.isCorrect ? "✓" : "  ";
      console.log(
        `  ${String.fromCharCode(65 + ansIndex)}. ${marker} ${ans.text}`,
      );
    });
  });
}

// Run test if this file is executed directly
if (require.main === module) {
  testAnswerRandomization();
}
