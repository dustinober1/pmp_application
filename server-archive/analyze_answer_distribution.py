#!/usr/bin/env python3
"""
Analyze the distribution of correct answers across PMP 2026 question banks.
This script examines the correctAnswerIndex field in each JSON file to 
determine the ratio/distribution of correct answers (0, 1, 2, or 3).
"""

import json
from collections import Counter
from pathlib import Path

def load_questions(file_path: str) -> list:
    """Load questions from a JSON file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def analyze_answer_distribution(questions: list) -> dict:
    """Analyze the distribution of correct answer indices in a question set."""
    answer_counts = Counter()
    
    for question in questions:
        correct_index = question.get('correctAnswerIndex')
        if correct_index is not None:
            answer_counts[correct_index] += 1
    
    total = sum(answer_counts.values())
    
    return {
        'counts': dict(answer_counts),
        'total': total,
        'percentages': {k: (v / total * 100) if total > 0 else 0 for k, v in answer_counts.items()}
    }

def print_analysis(name: str, analysis: dict):
    """Print a formatted analysis report."""
    print(f"\n{'='*60}")
    print(f"📊 {name}")
    print(f"{'='*60}")
    print(f"Total Questions: {analysis['total']}")
    print(f"\n{'Answer Index':<15} {'Count':<10} {'Percentage':<10}")
    print(f"{'-'*35}")
    
    # Sort by answer index
    for index in sorted(analysis['counts'].keys()):
        count = analysis['counts'][index]
        percentage = analysis['percentages'][index]
        letter = chr(65 + index)  # Convert 0->A, 1->B, 2->C, 3->D
        print(f"  {index} ({letter})        {count:<10} {percentage:.1f}%")

def main():
    # Define the question bank files
    base_path = Path(__file__).parent
    question_banks = {
        'People Domain': base_path / 'pmp_2026_people_bank.json',
        'Process Domain': base_path / 'pmp_2026_process_bank.json',
        'Business Domain': base_path / 'pmp_2026_business_bank.json'
    }
    
    all_questions = []
    
    print("\n" + "🔍 PMP 2026 Question Bank - Correct Answer Distribution Analysis")
    print("=" * 65)
    
    # Analyze each question bank
    for name, file_path in question_banks.items():
        if file_path.exists():
            questions = load_questions(file_path)
            all_questions.extend(questions)
            analysis = analyze_answer_distribution(questions)
            print_analysis(name, analysis)
        else:
            print(f"\n⚠️  File not found: {file_path}")
    
    # Combined analysis
    if all_questions:
        combined_analysis = analyze_answer_distribution(all_questions)
        print_analysis("📈 COMBINED TOTALS (All Domains)", combined_analysis)
        
        # Summary statistics
        print(f"\n{'='*60}")
        print("📉 SUMMARY STATISTICS")
        print(f"{'='*60}")
        
        counts = combined_analysis['counts']
        percentages = combined_analysis['percentages']
        
        # Find most and least common
        if counts:
            most_common = max(counts, key=counts.get)
            least_common = min(counts, key=counts.get)
            
            print(f"Most common correct answer: {most_common} ({chr(65 + most_common)}) - {counts[most_common]} questions ({percentages[most_common]:.1f}%)")
            print(f"Least common correct answer: {least_common} ({chr(65 + least_common)}) - {counts[least_common]} questions ({percentages[least_common]:.1f}%)")
            
            # Calculate ideal distribution (25% each)
            ideal_per_answer = combined_analysis['total'] / 4
            print(f"\nIdeal distribution (25% each): {ideal_per_answer:.1f} questions per answer")
            
            print(f"\n{'Answer':<10} {'Actual':<10} {'Ideal':<10} {'Deviation':<15}")
            print(f"{'-'*45}")
            for index in sorted(counts.keys()):
                deviation = counts[index] - ideal_per_answer
                deviation_pct = (deviation / ideal_per_answer) * 100 if ideal_per_answer > 0 else 0
                sign = "+" if deviation > 0 else ""
                print(f"  {index} ({chr(65 + index)})     {counts[index]:<10} {ideal_per_answer:.1f}      {sign}{deviation:.1f} ({sign}{deviation_pct:.1f}%)")

if __name__ == "__main__":
    main()
